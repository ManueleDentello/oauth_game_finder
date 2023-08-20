const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var igdb = require('./utils/igdb');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

var twitch_client_id;
var twitch_access_token;
var OAuth_cliend_id;
var OAuthClientSecret;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/oauth", require("./routes/auth"));
app.use('/api', require('./routes/api'));

app.get('/', async function (req, res, next) {
    res.render('games_ajax', { title: 'I migliori', apiFunction: '/api/best' });
});

app.get('/popular', async function (req, res, next) {
    res.render('games_ajax', { title: 'I più popolari', apiFunction: '/api/popular' });
});

app.get('/hype', async function (req, res, next) {
    res.render('games_ajax', { title: 'I più attesi', apiFunction: '/api/hype' });
});

app.get('/favorites', async function (req, res, next) {
    res.render('games_ajax', { title: 'I tuoi giochi preferiti', apiFunction: '/api/favorites' });
});

app.get('/search', async function (req, res, next) {
    res.render('games_ajax', { title: 'Risultati ricerca per: "' + req.query.txtRicerca + '"', apiFunction: '/api/search?txtRicerca=' + req.query.txtRicerca });
});

app.get('/game/:id', async function (req, res, next) {
    // Finire chiamata ajax lato client
    res.render('game', { apiFunction: '/api/game?id=' + req.query.id });
});

/*
* endpoint per reindirizzare a registrazione utente
*/
app.get('/user/register', async function (req, res, next) {
    try {
        // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
        const agent = new https.Agent({
            rejectUnauthorized: false, // Consente certificati autofirmati
        });

        // Effettua la chiamata al server su localhost:443
        const response = await axios.get('https://localhost:443/user/register', { httpsAgent: agent });
        //console.log('Risposta dal server:', response.data);
        res.send(response.data);

        //qui devo intercettare la pressione del pulsante 


        //response.data.client_id=OAuth_cliend_id;
        //response.data.client_secret=OAuthClientSecret;
    } catch (error) {
        console.error('Errore durante la chiamata al server:', error);
        res.status(500).send('Errore durante la chiamata al server');
    }
});

/*
* endpoint submit form per registrazione utente
*/
app.post('/user/register', async function (req, res, next) {
    try {

        const requestData = req.body;
        console.log(req.body);

        // Creazione di un'istanza Axios con l'agente HTTPS personalizzato
        const agent = new https.Agent({
            rejectUnauthorized: false, // Consente certificati autofirmati
        });

        // Effettua la chiamata al server su localhost:443
        const response = await axios.post('https://localhost:443/user/register', req.body, { httpsAgent: agent });
        console.log('Risposta dal server:', response.data);
        //res.send(response.data);
        res.redirect('/');
        //res.render('message');

    } catch (error) {
        console.error('Errore durante la chiamata al server:', error);
        res.status(500).send('Errore durante la chiamata al server');
    }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (req, res, next) {
    next(createError(403));
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