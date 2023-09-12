# Games finder

## To run

Generate Client_id and Client_secret from a OAuth2 server like this [one](https://github.com/Bonis98/OAuth2-server).

todo: add MongoDB configuration part

Copy .env.example to .env and complete it.

Start the oauth2-server.

Install all the modules with `npm install`.

Start the server with `npm start`.

## Disclaimer

This server is not production ready. Use at your own risk!

If you want to disable HTTPS, you need to comment the route in app.js and to set the flag secure:false in the express session