const db = require('../utils/mongodb');
const express = require('express')
const igdb = require('../utils/igdb');
const authentication = require('../utils/twitch.js');
const { route } = require('./auth');
const router = express.Router();

// IGDB api

var twitch_client_id = "";
var twitch_access_token = "";

async function get_twitch_stuff() {
    /* 
    * Retrieve twitch_client_id and twitch_access_token from utils/twitch.js
    */

    const risultato = await authentication.auth_to_twitch();

    twitch_client_id = risultato.client_id;
    twitch_access_token = risultato.access_token;
};

get_twitch_stuff();

/*
 *  ATTENTION: these are api endpoints, not web endpoints. They are called by handlebars views
 *  flow: web link -> web endpoint in app.js -> games_ajax or game_ajax view -> api endpoint (igdb or db) -> query igdb -> HTML render
 */
router.get('/best', async function(req, res, next) {
  let games = await igdb.getBest(twitch_client_id, twitch_access_token);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(games));
});

router.get('/popular', async function(req, res, next) {
    let games = await igdb.getPopular(twitch_client_id, twitch_access_token);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/hype', async function(req, res, next) {
    let games = await igdb.getHype(twitch_client_id, twitch_access_token);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(games));
});

router.get('/favorites', async function(req, res, next) {
    /*
    let user_name = lo prendiamo dal session
    let favorites = db.getFavorites(user_name);
    let favoriteString = favorites.join(,);
    */

    

    //console.log("favorite games ids: " + req.query.id);
    let favorites = await igdb.getFavorites(req.query.id/*favoriteString*/, twitch_client_id, twitch_access_token);  // req.query.id contains all favorite games ids
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(favorites));
});

router.get('/search', async function(req, res, next) {
    let output = await igdb.getSearched(req.query.txtRicerca, twitch_client_id, twitch_access_token);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(output));
});

router.get('/game/:id', async function(req, res, next) {
    let game = await igdb.getGame(req.params.id, twitch_client_id, twitch_access_token);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(game));
});

//  MongoDB endpoints
router.get('db/deleteFavorite/:id', async function(req, res, next) {
    // prendo lo user id dalla session
    // user_name o user_id = session.qualcosa
    let game_id = req.params.id;
    var result = db.deleteFavorite(user_name, game_id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('db/saveFavorite/:id', async function(req, res, next) {
    // prendo lo user id dalla session
    // user_name o user_id = session.qualcosa
    let game_id = req.params.id;
    var result = db.saveFavorite(user_name, game_id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

router.get('db/getFavorite/:id', async function(req, res, next) {
    // prendo lo user id dalla session
    // user_name o user_id = session.qualcosa
    let game_id = req.params.id;
    var result = db.getFavorite(user_name, game_id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

module.exports = router