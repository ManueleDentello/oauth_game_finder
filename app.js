const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
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
    cookie: { secure: false },
  }))

//partition of routes based on pages and authentication in separated modules
app.use("/", require("./routes/auth"));
app.use('/api', require('./routes/api'));

/*
*   all express endpoints (found in the menu)
*/
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
    //const access_token = req.session.token;
    //if(access_token){
        res.render('game_ajax', { apiFunction: '/api/game/' + req.params.id });
    //} else {
        //res.status(403).send('Access token not found in the session.');
       // res.redirect('/user/authorize');
   // }
});

app.get('/login', async function (req, res, next) {
    res.redirect('/user/authorize'); 
});

app.get('/secure', async function(req, res, next) {
    // Simple secure page
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