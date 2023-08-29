const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    username:{
      type: String,
      required: true,
    },
    game_id:{
      type: Number,
      required: true
    }
});

mongoose.model('favorites', favoriteSchema);