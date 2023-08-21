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

router.get('/client/register', async function (req, res, next) {
  // Dovrebbe essere tutto molto simile a /user/register, solo che il client_id e 
  // client_secret che ritorna vanno salvati in una variable globale come nel .env
  // importante ricordare che non e' necessario farlo ogni avvio dell'app
  res.send('non ancora implementata');
});

/*
* endpoint per reindirizzare a registrazione utente
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
* endpoint submit form per registrazione utente
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
    res.redirect('/user/authorize');

  } catch (error) {
    console.error('Errore durante la chiamata POST al server per la registrazione utente:', error);
    res.status(500).send('Errore durante la chiamata al server oauth2');
  }
});

router.get('/user/authorize', async(req, res) => {
  const authorizationUri = config.authorizeURL({
    redirect_uri: callbackUrl, 
    response_type: 'code',
    state: crypto.randomBytes(5).toString('hex'),
  });

  res.redirect(authorizationUri);
})

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: callbackUrl
  };

  try {
    const accessToken = await config.getToken(options);

    console.log('The resulting token: ', accessToken.token);

    req.session.token = accessToken.token.access_token;
    console.log("Ottenuto access token: " + accessToken.token.access_token);
    console.log(req.session)

    return res.redirect('/');

  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

router.get('/refresh-token', async (req, res) => {
  // not yet implemented correctly
  try {
    const refreshToken = req.session.refreshToken;

    const refreshParams = {
      refresh_token: refreshToken,
    };

    const result = await oauth2.accessToken.create({ refresh_token: refreshToken }).refresh();

    // Update the access token in the session
    //req.session.accessToken = result.token.access_token;

    res.send('Access token refreshed');
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    res.status(500).send('Error refreshing access token');
  }
});

router.get('/logout', async function (req, res, next) {
  req.session.token = '';
  res.status(200).send('Logout effettuato correttamente'); 
});

module.exports = router