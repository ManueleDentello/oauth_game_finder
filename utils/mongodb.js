const mongoose = require('mongoose');
require('./DB/favorites'); // cos'è sta roba?
const saltRounds = 10; //Recommended by npmjs.com

mongoose.connect(process.env.DB_CONNECT_STRING);

module.exports = {

   saveFavorite: async function(user_name, game_id) {
      // create document
      const favorite = new mongoose.model('favorites')({
         username: user_name,
         game_id: game_id
      });
      // save document to db
      try {
         // check if game is already saved
         let cegia = await this.getFavorite(user_name, game_id);
         if (cegia) {
            return {saved: true};
         }

         let newFavorite = await favorite.save();
         console.log('Document saved:', newFavorite);
         return { saved: true };
      }
      catch (error) {
         console.error('Error during save:', error);
         return { saved: false };
      }
   },

   getFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         // find a record with the same parameters
         const game = await favorite.findOne({ username: user_name, game_id: game_id });
         if (game) {
            console.log('Document found:', game);
            return { favorite: true };
         } else {
            console.log(`No document found for username ${user_name} and game_id ${game_id}`);
            return { favorite: false };
         }
      } catch (err) {
         console.error('Error during getFavorite', err);
      }
   },

   deleteFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         const result = await favorite.deleteOne({ username: user_name, game_id: game_id });
         if (result.deletedCount > 0) {
           console.log(`Document with user_name ${user_name} and game_id ${game_id} has been cancelled from the favorite games collection.`);
           return { deleted: true };
         } else {
           console.log(`No document with user_name ${user_name} and game_id ${game_id} was found in the favorite games collection.`);
           return { deleted: true };
         }
       } catch (err) {
         console.error('Error during deleteFavorite', err);
       }
   },

   getFavorites: async function(user_name) {
      // prepare document
      const query = new mongoose.model('favorites');
      try {
         const favorites = await query.find({ username: user_name });
         if (favorites.length > 0) {
           const result = favorites.map(game => game.game_id);
           console.log(`Favorite game found for user_name ${user_name}:`, result);
           return result;
         } else {
           console.log(`No favorite games found for the user_name ${user_name}.`);
           return null;
         }
       } catch (err) {
         console.error('Error during getFavorites', err);
      }
   }
}