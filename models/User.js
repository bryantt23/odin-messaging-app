const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    // Store hashed passwords onlyc:\Users\bryan\Documents\GitHub\odin-blog-api\createUserScript.js
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
