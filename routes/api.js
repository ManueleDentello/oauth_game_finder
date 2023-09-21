const db = require('../utils/mongodb');
const express = require('express')
const igdb = require('../utils/igdb');
const logger = require('../utils/logger');
const authentication = require('../utils/twitch.js');
const router = express.Router();

let twitchClientID;
let twitchAccessToken;

/* 
 * Retrieve twitch_client_id and twitch_access_token from utils/twitch.js
 */
async function getTwitchCredentials() {
    const risultato = await authentication.auth_to_twitch();

    twitchClientID = risultato.clientID;
    twitchAccessToken = risultato.accessToken;
};
getTwitchCredentials();


/*
 *  IGDB endpoints
 *  ATTENTION: these are api endpoints, not web endpoints. They are called by handlebars views to get the data to be rendered
 *  flow: web link -> web endpoint in app.js -> games_ajax or game_ajax view -> api endpoint (igdb or db) -> query igdb -> HTML render
 */
router.get('/best', async function (req, res, next) {
    let games = await igdb.getBest(twitchClientID, twitchAccessToken);
    logger.debug('JSON response from IGDB for /best: ' + games);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/popular', async function(req, res, next) {
    let games = await igdb.getPopular(twitchClientID, twitchAccessToken);
    logger.debug('JSON response from IGDB for /popular: ' + games);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/hype', async function(req, res, next) {
    let games = await igdb.getHype(twitchClientID, twitchAccessToken);
    logger.debug('JSON response from IGDB for /hype: ' + games);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/favorites', async function(req, res, next) {
    const userName = req.session.userName;
    let favoritesJSON;

    let favoritesIDsArray = await db.getFavorites(userName);
    if (favoritesIDsArray != null) {
        let favoriteIDsString = favoritesIDsArray.join(',');
        favoritesJSON = await igdb.getFavorites(favoriteIDsString, twitchClientID, twitchAccessToken);  // favoriteIdsString contains all favorite games ids
        
    }
    else
        favoritesJSON = '';

    logger.debug('JSON response from IGDB for /favorites: ' + favoritesJSON);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(favoritesJSON));
});

router.get('/search', async function(req, res, next) {
    const keyword = req.query.txtRicerca;

    let output = await igdb.getSearched(keyword, twitchClientID, twitchAccessToken);
    logger.debug('JSON response from IGDB for /search: ' + output);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(output));
});

router.get('/game/:id', async function(req, res, next) {
    const gameID = req.params.id;

    let game = await igdb.getGame(gameID, twitchClientID, twitchAccessToken);
    logger.debug('JSON response from IGDB for /game: ' + game);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(game));
});

/*
 *  MongoDB endpoints
 */
router.get('/deleteFavorite/:id', async function(req, res, next) {
    const userName = req.session.userName;
    const gameID = req.params.id;

    let result = await db.deleteFavorite(userName, gameID);
    logger.debug('Response from MongoDB for /deleteFavorite: ' + result);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('/saveFavorite/:id', async function(req, res, next) {
    const userName = req.session.userName;
    const gameID = req.params.id;

    let result = await db.saveFavorite(userName, gameID);
    logger.debug('Response from MongoDB for /saveFavorite: ' + result);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('/getFavorite/:id', async function(req, res, next) {
    const userName = req.session.userName;
    const gameID = req.params.id;

    let result = await db.getFavorite(userName, gameID);
    logger.debug('Response from MongoDB for /getFavorite: ' + result);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

module.exports = router