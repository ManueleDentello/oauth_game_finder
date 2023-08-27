const express = require('express');
const router = express.Router();
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode, CreateApplicaiton } = require('simple-oauth2');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const async = require('hbs/lib/async');

const callbackUrl = "http://localhost:4000/callback";
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
* NOT PART OF OAUTH FLOW (JUST FOR DEMO)
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
    console.error('Errore durante la chiamata GET al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

/*
* NOT PART OF OAUTH FLOW (JUST FOR DEMO)
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
    console.log('Risposta dal server:', response.data);
    res.redirect('/');

  } catch (error) {
    console.error('Errore durante la chiamata POST al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
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
  const options = {
    code,
    redirect_uri: callbackUrl
  };

  try {
    const accessToken = await config.getToken(options);

    console.log('The resulting token: ', accessToken.token);

    console.log(accessToken);
    req.session.token = accessToken.token.access_token; // store the token in the browser session
    // salvo tutto quello che ritorna il server oauth nella session
    req.session.oauth_token = accessToken.token // store the token in the browser session
    console.log("Ottenuto access token: " + accessToken.token.access_token);
    console.log(req.session)

    return res.redirect('/username'); // redirect to home page --> da cambiare verso /username

  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

router.get('/username', async (req, res) => {
  try {
    // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
    const agent = new https.Agent({
      rejectUnauthorized: false, // Consente certificati autofirmati
    });

    const headers = {
      'Authorization': 'Bearer ' + req.session.token
    };

    // Effettua la chiamata al server su localhost:443
    const response = await axios.get('https://localhost:443/oauth/username', { headers: headers }, { httpsAgent: agent });
    //console.log('Header verso server:', req.headers);
    req.session.userName = response.data;
    //console.log(req.session.userName);
    res.redirect('/');
  } catch (error) {
    console.error('Errore durante la chiamata POST al server per l\'accesso alla risorsa protetta (username):', error);
    console.log('Header verso server:', req.headers);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

/*
* request a new token to oauth server when the old one expires
*/
router.get('/refresh-token', async (req, res) => {
  // not yet implemented correctly
  try {
    const refreshToken = req.session.oauth_token.refresh_token;
    console.log(refreshToken)

    const refreshParams = {
      refresh_token: refreshToken,
    };

    const result = await config.accessToken.create({ refresh_token: refreshToken }).refresh();

    console.log(result)
    // Update the access token in the session
    //req.session.accessToken = result.token.access_token;

    res.send('Access token refreshed');
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    res.status(500).send('Error refreshing access token');
  }
});
router.get('/login', async function (req, res, next) {
  res.redirect('/user/authorize'); 
});

router.get('/logout', async function (req, res, next) {
  req.session.token = '';
  res.render('message', { message: 'Logout effettuato correttamente', redirect: '' });
});

module.exports = router