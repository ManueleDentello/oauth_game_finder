const axios = require('axios');
const logger = require('./logger');

const GRANT_TYPE = "client_credentials";
let access_token;
let client_id;
let credentials;

async function auth_to_twitch() {
  
  igdb_client_id = process.env.IGDB_CLIENT_ID
  igdb_client_secret = process.env.IGDB_CLIENT_SECRET

  try {
    // Set the URL for the HTTP request
    const url = 'https://id.twitch.tv/oauth2/token';

    const data = {
        client_id: igdb_client_id,
        client_secret: igdb_client_secret,
        grant_type: GRANT_TYPE
      }

    // Make the HTTP POST request
    const response = await axios.post(url, data);

    // Handle the response data
    logger.debug('Twitch authentication response data:', response.data);

    // mi salvo i dati dal json di risposta che mi servono per dopo
    access_token = response.data.access_token;
    client_id = igdb_client_id;

    credentials = { 
      clientID: igdb_client_id, 
      accessToken: response.data.access_token };

    return credentials;

  } catch (error) {
    // Handle any errors that occurred during the HTTP request
    logger.error('Twitch error:', error.message);
  }
}

module.exports = {
  auth_to_twitch: auth_to_twitch
}
