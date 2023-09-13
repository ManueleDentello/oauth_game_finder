/* Middlewares to get new request from express */
const morgan = require("morgan");
const logger = require("./logger.js");

const stream = {
  // Use the http severity
  write: (message) => logger.http(message),
};

const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  ":remote-addr - :method - Path::url - :status - :response-time ms - :user-agent",
  // Options: in this case, I overwrote the stream and the skip logic.
);

module.exports = morganMiddleware;