const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    username:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the user
    game_id:{
      type: Number,
      required: true
    } // Hash password of the user;
});

mongoose.model('favorites', favoriteSchema);