const axios = require('axios');

const GRANT_TYPE = "client_credentials";
let access_token;
let client_id;
let credentials;

async function auth_to_twitch() {
  
  igdb_client_id = process.env.IGDB_CLIENT_ID
  igdb_client_secret = process.env.IGDB_CLIENT_SECRET

  try {
    // Set the URL for the HTTP request
    const url = 'https://id.twitch.tv/oauth2/token'; // Replace with the actual API endpoint

    const data = {
        client_id: igdb_client_id,
        client_secret: igdb_client_secret,
        grant_type: GRANT_TYPE
      }

    // Make the HTTP POST request
    const response = await axios.post(url, data);

    // Handle the response data
    console.log('Twitch authentication response data:', response.data);

    // mi salvo i dati dal json di risposta che mi servono per dopo
    access_token = response.data.access_token;
    client_id = igdb_client_id;

    credentials = { client_id: igdb_client_id, access_token: response.data.access_token };

  } catch (error) {
    // Handle any errors that occurred during the HTTP request
    console.error('Twitch error:', error.message);
  }
  return credentials;
}

// da aggiungere funzioen per refresh token twitch

module.exports = {
  auth_to_twitch: auth_to_twitch,
  access_token: access_token,
  client_id: client_id
}
