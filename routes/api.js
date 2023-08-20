const path = require('path') // has path and __dirname
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
    console.log("id dei giochi preferiti: " + req.query.id);
    let favorites = await igdb.getFavorites(req.query.id, twitch_client_id, twitch_access_token);  // req.query sarebbe l'insieme degli id dei giochi preferiti aggiunti da games_ajax
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

module.exports = router