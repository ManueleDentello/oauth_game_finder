const mongoose = require('mongoose');
const logger = require('./logger');
require('./DB/favorites');

mongoose.connect(process.env.DB_CONNECT_STRING);

module.exports = {

   /*
    * functions to interact with database
    * each one returns a JSON object with a boolean field with the result
    * error cases are handled by the jquery call with .fail
    */

   saveFavorite: async function(user_name, game_id) {
      // create document
      const favorite = new mongoose.model('favorites')({
         username: user_name,
         game_id: game_id
      });
      
      try {
         // check if game is already saved
         let alreadySaved = await this.getFavorite(user_name, game_id);
         if (alreadySaved.favorite) {
            logger.info('Game ' + game_id + ' already saved in DB for username ' + user_name);
            return {saved: true};
         }

         // save document to db
         let newFavorite = await favorite.save();
         logger.info('Game saved:', newFavorite);
         return { saved: true };
      }
      catch (error) {
         logger.error('Error during save:', error);
         throw error;
      }
   },

   getFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         // find a record with the same parameters
         const game = await favorite.findOne({ username: user_name, game_id: game_id });
         if (game) {
            logger.info('Favorite game found:', game);
            return { favorite: true };
         } else {
            logger.info(`No favorite game found for username ${user_name} and game_id ${game_id}`);
            return { favorite: false };
         }
      } catch (error) {
         logger.error('Error during getFavorite', error);
         throw error;
      }
   },

   deleteFavorite: async function(user_name, game_id) {
      // prepare document
      const favorite = new mongoose.model('favorites');
      try {
         const result = await favorite.deleteOne({ username: user_name, game_id: game_id });
         if (result.deletedCount > 0) {
            logger.info(`Favorite game with user_name ${user_name} and game_id ${game_id} has been cancelled from the favorite games collection.`);
           return { deleted: true };
         } else {
            logger.info(`Favorite game with user_name ${user_name} and game_id ${game_id} was found in the favorite games collection.`);
           return { deleted: true };
         }
       } catch (error) {
         logger.error('Error during deleteFavorite', error);
         throw error;
       }
   },

   getFavorites: async function(user_name) {
      // prepare document
      const query = new mongoose.model('favorites');
      try {
         const favorites = await query.find({ username: user_name });
         if (favorites.length > 0) {
           const result = favorites.map(game => game.game_id);
           logger.info(`Favorite game found for user_name ${user_name}:`, result);
           return result;
         } else {
            logger.info(`No favorite games found for the user_name ${user_name}.`);
           return null;
         }
       } catch (error) {
         logger.error('Error during getFavorites', error);
         throw error;
      }
   }
}