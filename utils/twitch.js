const axios = require('axios');
const logger = require('./logger');
const GRANT_TYPE = "client_credentials";
let igdb_client_id = process.env.IGDB_CLIENT_ID
let igdb_client_secret = process.env.IGDB_CLIENT_SECRET

async function auth_to_twitch() {
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
    logger.info('Twitch authentication response data:' + JSON.stringify(response.data));

    let credentials = { 
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
