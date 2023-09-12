const express = require('express');
const router = express.Router();
const { AuthorizationCode } = require('simple-oauth2');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const logger = require('../utils/logger');

const callbackUrl = process.env.OAUTH_CALLBACK_URL;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // fix for 'Access Token Error Client request error: self-signed certificate' in /callback route
const oauthServer = process.env.OAUTH_HOST;
const EXPIRATION_WINDOW_IN_SECONDS = 300;
const REFRESH_TOKEN_GRANT_TYPE = 'refresh_token';

const config = new AuthorizationCode({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: process.env.OAUTH_HOST,
    tokenPath: process.env.OAUTH_TOKEN_PATH,
    authorizePath: process.env.OAUTH_TOKEN_AUTHORIZE,
  },
});

/*
* Client registration: server reroutes the request to OAuth server in order to get the form
* no need to do it every time the app starts (values remain the same)
*/
router.get('/client/register', async function (req, res, next) {
  try {
    // Axios instance with special header that permits self signed certificates
    const agent = new https.Agent({
      rejectUnauthorized: false, 
    });

    // call OAuthServer
    const response = await axios.get(oauthServer + '/client/register', { httpsAgent: agent });
    res.send(response.data);

  } catch (error) {
    console.error('Error on GET /client/register to OAuth server: ', error);
    res.status(500).send('Error on GET /client/register to OAuth server');
  }

});

/*
* Client registration: intercepts compiled form and send data to OAuth server
* no need to do it every time the app starts (values remain the same)
*/
router.post('/client/register', async function (req, res, next) {
  try {
    user = req.session.userName;

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.post(oauthServer + '/client/register', req.body, { httpsAgent: agent });  // req.body contains the compiled form
    res.render('message', { title: 'Registrazione client OAuth', message: JSON.stringify(response.data), user: user });

  } catch (error) {
    console.error('Error on POST /client/register to OAuth server:', error);
    res.status(500).send('Error on POST /client/register to OAuth server');
  }
});

/*
* User registration: server reroutes the request to OAuth server in order to get the form
*/
router.get('/user/register', async function (req, res, next) {
  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    // Effettua la chiamata al server su localhost:443
    const response = await axios.get(oauthServer + '/user/register', { httpsAgent: agent });
    res.send(response.data);

  } catch (error) {
    logger.error('Errore durante la chiamata GET al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

/*
* User registration: intercepts compiled form and send data to OAuth server
*/
router.post('/user/register', async function (req, res, next) {
  try {

    console.log(req.body);

    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    // Effettua la chiamata al server su localhost:443
    const response = await axios.post(oauthServer + '/user/register', req.body, { httpsAgent: agent });
    
    logger.debug(`Risposta dal server oauth creazione utente: ` + response.data);

    logger.info('Utente registrato con successo');

    res.render('message', { title: 'Risposta server oauth', message: response.data, user: req.session.userName });

  } catch (error) {
    logger.error('Errore durante la chiamata POST al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la registrazione');
  }
});

/*
* request authorization code to oauth server
*/
router.get('/login', async(req, res) => {
  const authorizationUri = config.authorizeURL({
    redirect_uri: callbackUrl, 
    response_type: 'code',
    state: crypto.randomBytes(5).toString('hex'),
  });

  res.redirect(authorizationUri);
})

/*
* get the authorization code back, request token to oauth server and store it
*/
router.get('/callback', async (req, res) => {
  const { code } = req.query; // create a variable that stores the value of "code" query parameter
  //console.log('Quello che c\'è in req: \n' + req.body);
  const options = {
    code,
    redirect_uri: callbackUrl
  };

  try {
    const accessToken = await config.getToken(options);
    logger.info('Contenuto del token: ' + JSON.stringify(accessToken));

    // Save the entire token in the session. Attention: the data is the accessToken.token object
    req.session.oauth_token = accessToken.token;

    logger.info('Token: ' + req.session.oauth_token.access_token);

    // Mando utente verso redirect per prendere lo username
    res.redirect('/username');

  } catch (error) {
    logger.error('Error during the retrieval of the token: ', error.output);
    res.status(500).json('Authentication failed');
  }
});

router.get('/username', async (req, res) => {
  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    logger.info('access_token ', req.session.oauth_token.access_token);

    const headers = {
      'Authorization': 'Bearer ' + req.session.oauth_token.access_token
    };

    // Effettua la chiamata al server su localhost:443
    const response = await axios.get(oauthServer + '/oauth/username', { headers: headers }, { httpsAgent: agent });

    // Salvo lo username nella sessione corrente
    req.session.userName = response.data;
    logger.info('Utente loggato: ' + req.session.userName);

    // Mando l'utente nella home - fine autenticazione
    res.redirect('/');
  } catch (error) {
    logger.error('Errore durante la chiamata GET al server per l\'accesso alla risorsa protetta (username):', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

/*
* request a new token to oauth server when the old one expires
*/
router.get('/refresh-token', async (req, res) => {
  let accessToken = await config.createToken(req.session.oauth_token);
    
  //if(accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      const refreshParams = {
        refresh_token: req.session.oauth_token.refresh_token,
        grant_type: REFRESH_TOKEN_GRANT_TYPE,
        redirect_uri: callbackUrl
      };

      const result = await accessToken.refresh(refreshParams);
      
      // Save internally all info coming from the OAuth server
      req.session.oauth_token = result.token;

      logger.info('Token refreshed');

      //res.send('Access token refreshed');
      next();
    } catch (error) {
      console.error('Error refreshing access token:', error.output);
      res.status(500).send('Error refreshing access token');
    }
  //}
});

router.get('/logout', async function (req, res, next) {
  let userName = req.session.userName;

  if(!req.session.oauth_token){
    res.render('message', { title: 'Logout', message: 'Devi essere loggato per effettuare il logout', user: userName });
  } else {
    // delete all data in session and set a blank username
    userName = '';
    req.session.destroy();

    // Revokes both tokens, refresh token is only revoked if the access_token is properly revoked
    let accessToken = await config.createToken(req.session.oauth_token);
    try {
      await accessToken.revokeAll();
      logger.info('Access token and refresh token deleted');
    } catch (error) {
      logger.error('Error revoking token: ', error.message);
  }

    res.render('message', { title: 'Logout', message: 'Logout effettuato correttamente', user: userName });
  }
});

router.get('/userinfo', (req, res) => {
  res.send(req.session);
});

module.exports = { router, config }