const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const session = require('express-session');
require('dotenv').config();
const auth = require('./routes/auth'); 
const app = express();
const callbackUrl = process.env.OAUTH_CALLBACK_URL;
const EXPIRATION_WINDOW_IN_SECONDS = 300;
const REFRESH_TOKEN_GRANT_TYPE = 'refresh_token';

// handlebars setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// express middlewares setup
app.use(require('./utils/morgan')); // Usa morgan per mostrare i log delle richieste 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// HTTPS support
let httpsRedirect = function (req, res, next){
    if (req.secure) return next()
    res.redirect(307, 'https://' + req.hostname + req.url)
};

// express-session setup
let sess = {
    secret: 'oauth-game-finder-secret',
    token: '',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },  // ON if https, OFF if http
  }

if (app.get('env') === 'production') {
    sess.cookie.secure = true // serve secure cookies
    app.all('*', httpsRedirect);
}

app.use(session(sess));

// THIS SHOULD NOT BE RELEVANT
//Redirect all http requests to https (comment out next 4 lines if you want to run a test)
/*
app.all('*', function(req, res, next){
    if (req.secure) return next()
    res.redirect(307, 'https://' + req.hostname + req.url)
})
*/

// constantly check the validy of the token and refresh if that's the case
app.all('*', async function(req, res, next){
    // only if there's already an access token
    if (req.session.oauth_token) {
        let accessToken = await auth.config.createToken(req.session.oauth_token);
        logger.info('Checking access token validity...');

        // check if the token expires within the amount of time specified
        if (accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
            try {
                const refreshParams = {
                    refresh_token: req.session.oauth_token.refresh_token,
                    grant_type: REFRESH_TOKEN_GRANT_TYPE,
                    redirect_uri: callbackUrl
                };
                const result = await accessToken.refresh(refreshParams);

                // Save the result in the session
                req.session.oauth_token = result.token;
                logger.info('Token refreshed');
            } catch (error) {
                console.error('Error refreshing access token:', error.message);
                next(error);
            }
        }
    }
    next();
  })

//partition of routes in separated modules based on authentication endpoints and api endpoints (mongodb or igdb)
app.use("/", auth.router);
app.use('/api', require('./routes/api'));

/*
*   all express endpoints (found in the menu)
*/
app.get('/', async function (req, res, next) {
    const userName = req.session.userName;
    res.render('game_tiles', { title: 'I migliori', apiFunction: '/api/best', user: userName });
});

app.get('/popular', async function (req, res, next) {
    const userName = req.session.userName;
    res.render('game_tiles', { title: 'I più popolari', apiFunction: '/api/popular', user: userName });
});

app.get('/hype', async function (req, res, next) {
    const userName = req.session.userName;
    res.render('game_tiles', { title: 'I più attesi', apiFunction: '/api/hype', user: userName });
});

app.get('/favorites', async function (req, res, next) {
    const userName = req.session.userName;
    const accessToken = req.session.oauth_token;

    if (accessToken)
        res.render('game_tiles', { title: 'I tuoi giochi preferiti', apiFunction: '/api/favorites', user: userName });
    else
        res.render('message', { title: 'I tuoi preferiti', message: "Non puoi vedere i preferiti se non sei autenticato", user: userName });
});

app.get('/search', async function (req, res, next) {
    const userName = req.session.userName;

    if (req.query.txtRicerca == '')
        res.render('message', { title: 'Risultati ricerca', message: 'La ricerca è vuota', user: userName });
    else
        res.render('game_tiles', { title: 'Risultati ricerca per: "' + req.query.txtRicerca + '"', apiFunction: '/api/search?txtRicerca=' + req.query.txtRicerca, user: userName });
});

app.get('/game/:id', async function (req, res, next) {
    const userName = req.session.userName;

    if (userName)
        res.render('game_details_logged', { apiFunction: '/api/game/' + req.params.id, user: userName, dbGet: '/api/getFavorite/' + req.params.id, dbSave: '/api/saveFavorite/' + req.params.id, dbDelete: '/api/deleteFavorite/' + req.params.id });
    else 
        res.render('game_details_guest', { apiFunction: '/api/game/' + req.params.id, user: userName });
    });

//  example of a secure page that prints access_token
app.get('/secure', async function(req, res, next) {
    const access_token = req.session.oauth_token.access_token;

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
