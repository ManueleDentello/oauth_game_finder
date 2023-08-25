const mongoose = require('mongoose');
require('./DB/favorites'); // cos'è sta roba?
const saltRounds = 10; //Recommended by npmjs.com

config = process.env.MONGODB;

mongoose.connect(config);

module.exports = {

   saveFavorite: async function(user_name, game_id) {
      // create document
      const favorite = new mongoose.model('favorites')({
         user_name: user_name,
         game_id: game_id
      });
      // save document to db
      try {
         let newFavorite = await favorite.save();
         console.log('Document saved:', newFavorite);
         return true;
      }
      catch (error) {
         console.error('Error during save:', error);
         return false;
      }
   },

   getFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         // find a record with the same parameters
         const game = await favorite.findOne({ user_name: user_name, game_id: game_id });
         if (game) {
            console.log('Document found in the favorite games collection:', game);
            return true;
         } else {
            console.log('No document found in the favorite games collection.');
            return false;
         }
      } catch (err) {
         console.error('Error during getFavorite', err);
      }
   },

   deleteFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         const result = await favorite.deleteOne({ user_name: user_name, game_id: game_id });
         if (result.deletedCount > 0) {
           console.log('Document with user_name ${user_name} and game_id ${game_id} has been cancelled from the favorite games collection.');
           return true;
         } else {
           console.log('No document with user_name ${user_name} and game_id ${game_id} was found in the favorite games collection.');
           return false;
         }
       } catch (err) {
         console.error('Error during deleteFavorite', err);
       }
   },

   getFavorites: async function(user_name) {
      // prepare document
      const query = new mongoose.model('favorites');
      try {
         const favorites = await query.find({ user_name: user_name });
         if (favorites.length > 0) {
           const result = favorites.map(game => game.game_id);
           console.log('Favorite game found for user_name ${user_name}:', result);
           return result;
         } else {
           console.log('No favorite games found for the user_name ${user_name}.');
           return 0;
         }
       } catch (err) {
         console.error('Error during getFavorites', err);
      }
   }
}