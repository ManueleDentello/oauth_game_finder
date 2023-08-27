const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const twitch = require('./utils/twitch.js');
require('dotenv').config();

const app = express();

// handlebars setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// express middlewares setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'oauth-game-finder',
    token: '',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },  // to be modified
  }))

/*
 proposal on how to handle igdb connection at the startup of the server and to store in the session client_id and client_secret
app.use(async function (req, res, next) {
    if (!req.session.twitch_client_id || !req.session.twitch_client_secret) {
        const credentials = await twitch.auth_to_twitch();
        req.session.twitch_client_id = credentials.client_id;
        req.session.twitch_client_secret = credentials.client_secret;
    }
    // testare per vedere se prende il valore correttamente e per vedere quante volte gira
    console.log('Twitch client id: ' + req.session.twitch_client_id + ', Twitch client secret: ' + req.session.twitch_client_secret);
    next();
  });
*/

//partition of routes in separated modules based on authentication endpoints and api endpoints (mongodb or igdb)
app.use("/", require("./routes/auth"));
app.use('/api', require('./routes/api'));

/*
*   all express endpoints (found in the menu)
*/
app.get('/', async function (req, res, next) {
    user = req.session.userName;
    console.log(user);
    res.render('games_ajax', { title: 'I migliori', apiFunction: '/api/best', user: user });
});

app.get('/popular', async function (req, res, next) {
    user = req.session.user_name;
    res.render('games_ajax', { title: 'I più popolari', apiFunction: '/api/popular', user: user });
});

app.get('/hype', async function (req, res, next) {
    user = req.session.user_name;
    res.render('games_ajax', { title: 'I più attesi', apiFunction: '/api/hype', user: user });
});

app.get('/favorites', async function (req, res, next) {
    user = req.session.user_name;
    const access_token = req.session.token;
    if (access_token) {
        res.render('games_ajax', { title: 'I tuoi giochi preferiti', apiFunction: '/api/favorites', user: user });
    } else {
        //res.status(403).send('Access token not found in the session.');
        //res.redirect('/user/authorize');
        res.render('message', { message: "Devi effettuare l'accesso per poter visualizzare il contenuto", redirect: "/user/authorize" });
    }
});

app.get('/search', async function (req, res, next) {
    user = req.session.user_name;
    res.render('games_ajax', { title: 'Risultati ricerca per: "' + req.query.txtRicerca + '"', apiFunction: '/api/search?txtRicerca=' + req.query.txtRicerca, user: user });
});

app.get('/game/:id', async function (req, res, next) {
    user = req.session.user_name;
    res.render('game_ajax', { apiFunction: '/api/game/' + req.params.id, user: user, dbGet: '/db/getFavorite/' + req.params.id, dbSave: '/db/saveFavorite' + req.params.id, dbDelete: '/db/deleteFavorite' + req.params.id });
});

//  example of a secure page
app.get('/secure', async function(req, res, next) {
    user = req.session.user_name;
    const access_token = req.session.token;
    if(access_token){
        res.status(200).send("Sei in una pagina sicura con " + access_token);
    } else {
        res.status(403).send('Access token not found in the session.');
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;