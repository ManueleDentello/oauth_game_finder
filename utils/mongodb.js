const mongoose = require('mongoose');
require('./DB/favorites');
const saltRounds = 10; //Recommended by npmjs.com

config = process.env.MONGODB;

mongoose.connect(config);

module.exports = {

   saveFavorite: async function(client_id, game_id) {
      // logic to save to db
   },

   deleteFavorite: async function(client_id, game_id) {
      // logic to remove from db
   },

   getFavorite: async function(client_id, game_id) {
      // logic to get all favorite from db
   },
}