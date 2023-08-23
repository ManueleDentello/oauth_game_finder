const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    client_id:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the user
    game_id:{
      type: Integer,
      required: true
    } // Hash password of the user;
});

mongoose.model('favorite', userSchema);