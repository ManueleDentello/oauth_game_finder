const path = require('path') // has path and __dirname
const express = require('express')
const router = express.Router()
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode, CreateApplicaiton } = require('simple-oauth2');

const callbackUrl = "http://localhost:4000/oauth/callback";

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

async function run() {
  const client = new AuthorizationCode(config);

  const authorizationUri = client.authorizeURL({
    redirect_uri: 'http://localhost:4000/oauth/callback',
    state: crypto.randomBytes(5).toString('hex'),
  });

  // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
  res.redirect(authorizationUri);

  const tokenParams = {
    redirect_uri: 'http://localhost:4000/oauth/callback',
    response_type: 'code'
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    console.log(accessToken);
  } catch (error) {
    console.log('Access Token Error', error.message);
  }
}

//run();


router.get('/client', (req, res) => {
  //res.sendFile(path.join(__dirname, '../public/userRegistration.html'))
  res.redirect("https://localhost/client/register");
});

router.get('/user', (req, res) => {
  //res.sendFile(path.join(__dirname, '../public/userRegistration.html'))
  res.redirect("https://localhost/user/register");
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
  };

  try {
    const accessToken = await client.getToken(options);

    console.log('The resulting token: ', accessToken.token);

    return res.status(200).json(accessToken.token);
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

module.exports = router