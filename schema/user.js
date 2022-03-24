const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  imageUrl: String,
  favorites: [
    {
      favorite: String,
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
    },
  ],
});

const User = mongoose.model('User', userSchema )

module.exports = User;