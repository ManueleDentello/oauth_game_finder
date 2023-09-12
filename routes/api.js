const db = require('../utils/mongodb');
const express = require('express')
const igdb = require('../utils/igdb');
const logger = require('../utils/logger');
const { route } = require('./auth');
const router = express.Router();

/*
 *  IGDB endpoints
 *  ATTENTION: these are api endpoints, not web endpoints. They are called by handlebars views to get the data to be rendered
 *  flow: web link -> web endpoint in app.js -> games_ajax or game_ajax view -> api endpoint (igdb or db) -> query igdb -> HTML render
 */
router.get('/best', async function (req, res, next) {
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;

    let games = await igdb.getBest(twitchClientID, twitchAccessToken);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/popular', async function(req, res, next) {
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;

    let games = await igdb.getPopular(twitchClientID, twitchAccessToken);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/hype', async function(req, res, next) {
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;

    let games = await igdb.getHype(twitchClientID, twitchAccessToken);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/favorites', async function(req, res, next) {
    const userName = req.session.userName;
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;
    let favoritesJSON;

    let favoritesIDsArray = await db.getFavorites(userName);
    if (favoritesIDsArray != null) {
        let favoriteIDsString = favoritesIDsArray.join(',');
        favoritesJSON = await igdb.getFavorites(favoriteIDsString, twitchClientID, twitchAccessToken);  // favoriteIdsString contains all favorite games ids
    }
    else
        favoritesJSON = '';

    logger.debug('Favorites: ', favoritesJSON);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(favoritesJSON));
});

router.get('/search', async function(req, res, next) {
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;
    const keywordSearched = req.query.txtRicerca;

    let output = await igdb.getSearched(keywordSearched, twitchClientID, twitchAccessToken);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(output));
});

router.get('/game/:id', async function(req, res, next) {
    const twitchClientID = req.session.twitchClientID;
    const twitchAccessToken = req.session.twitchAccessToken;
    const gameID = req.params.id;

    let game = await igdb.getGame(gameID, twitchClientID, twitchAccessToken);

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

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('/saveFavorite/:id', async function(req, res, next) {
    const userName = req.session.userName;
    const gameID = req.params.id;

    let result = await db.saveFavorite(userName, gameID);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('/getFavorite/:id', async function(req, res, next) {
    const userName = req.session.userName;
    const gameID = req.params.id;

    let result = await db.getFavorite(userName, gameID);

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

module.exports = router