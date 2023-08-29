const express = require('express');
const router = express.Router();
const { AuthorizationCode } = require('simple-oauth2');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { access } = require('fs');

const callbackUrl = process.env.OAUTH_CALLBACK_URL;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // fix for 'Access Token Error Client request error: self-signed certificate' in /callback route

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
* NOT PART OF OAUTH FLOW (JUST FOR DEMO)
* Client registration: server reroutes the request to OAuth server in order to get the form
* no need to do it every time the app starts
*/
router.get('/client/register', async function (req, res, next) {
  // Dovrebbe essere tutto molto simile a /user/register, solo che il client_id e 
  // client_secret che ritorna vanno salvati in una variable globale come nel .env
  // importante ricordare che non e' necessario farlo ogni avvio dell'app

  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    // Effettua la chiamata al server su localhost:443
    const response = await axios.get('https://localhost:443/client/register', { httpsAgent: agent });
    res.send(response.data);

  } catch (error) {
    console.error('Error on GET /client/register to OAuth server: ', error);
    res.status(500).send('Error on GET /client/register to OAuth server');
  }

});

/*
* NOT PART OF OAUTH FLOW (JUST FOR DEMO)
* Client registration: intercepts compiled form and send data to OAuth server
*/
router.post('/client/register', async function (req, res, next) {
  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    // Effettua la chiamata al server su localhost:443
    const response = await axios.post('https://localhost:443/client/register', req.body, { httpsAgent: agent });  // req.body contains the compiled form
    console.log('Risposta dal server:', response.data); // just to show that oauth server sends client id and client secret
    res.redirect('/');

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
    const response = await axios.get('https://localhost:443/user/register', { httpsAgent: agent });
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
    const response = await axios.post('https://localhost:443/user/register', req.body, { httpsAgent: agent });
    
    logger.debug(`Risposta dal server oauth creazione utente: ` + response.data);

    logger.info('Utente registrato con successo');

    res.render('message', { title: 'Risposta server oauth', message: response.data, redirect: '' });

  } catch (error) {
    logger.error('Errore durante la chiamata POST al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la registrazione');
  }
});

/*
* request authorization code to oauth server
*/
router.get('/user/authorize', async(req, res) => {
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
  console.log('Quello che c\'è in req: \n' + req.body);
  const options = {
    code,
    redirect_uri: callbackUrl
  };

  try {
    const accessToken = await config.getToken(options);

    accessToken.expired();

    // Aggiungo token di sessione alla sessione corrente
    //req.session.token = accessToken.token.access_token;

    // Salvo tutto quello che ritorna il server oauth nella sessione corrente
    req.session.oauth_token = accessToken.token;

    logger.info("Ottenuto access token: " + accessToken.token.access_token);

    // Mando utente verso redirect per prendere lo username
    res.redirect('/username');

  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
});

router.get('/username', async (req, res) => {
  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    const headers = {
      'Authorization': 'Bearer ' + req.session.oauth_token.access_token
    };

    // Effettua la chiamata al server su localhost:443
    const response = await axios.get('https://localhost:443/oauth/username', { headers: headers }, { httpsAgent: agent });

    // Salvo lo username nella sessione corrente
    req.session.userName = response.data;
    logger.info('Utente loggato: ' + req.session.userName);

    // Mando l'utente nella home - fine autenticazione
    res.redirect('/');
  } catch (error) {
    logger.error('Errore durante la chiamata POST al server per l\'accesso alla risorsa protetta (username):', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

/*
* request a new token to oauth server when the old one expires
*/
router.get('/refresh-token', async (req, res) => {
  const accessToken = await config.createToken(req.session.oauth_token);
  const EXPIRATION_WINDOW_IN_SECONDS = 3599;
    
  if(accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      const refreshParams = {
        refresh_token: req.session.oauth_token.refresh_token,
        grant_type: 'refresh_token',
        redirect_uri: callbackUrl
      };

      const result = await accessToken.refresh(refreshParams);
      
      // Salvo tutto quello che ritorna il server oauth nella sessione corrente
      req.session.oauth_token = result.token;

      logger.info('Token refreshato');

      res.send('Access token refreshed');
    } catch (error) {
      console.error('Error refreshing access token:', error.message);
      res.status(500).send('Error refreshing access token');
    }
  }
});
router.get('/login', async function (req, res, next) {
  res.redirect('/user/authorize'); 
});

router.get('/logout', async function (req, res, next) {
  if(!req.session.token){
    res.render('message', { title: 'Logout', message: 'Devi essere loggato per effettuare il logout', redirect: '/login' });
  } else {
    req.session.userName = '';
    //req.session.oauth_token;
    res.render('message', { title: 'Logout', message: 'Logout effettuato correttamente', redirect: '' });
  }

  // revocare token, auth code e quant'altro?
  // chiudere connessione al database
});

router.get('/userinfo', (req, res) => {
  res.send(req.session);
});

module.exports = { router, config }