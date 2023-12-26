const bcrypt = require('bcrypt');
const User = require('../models/User'); // Assuming you have a User model defined as previously discussed
require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
    createAnonymousUser();
  })
  .catch(err => {
    console.error('Database connection error', err);
  })
  .finally(() => {
    mongoose.disconnect();
  });

async function createAnonymousUser() {
  try {
    // Check if anonymous user already exists
    let user = await User.findOne({ name: 'anonymous' });

    if (!user) {
      // If not, create a new anonymous user
      const hashedPassword = await bcrypt.hash('password', 10);
      user = await User.create({ name: 'anonymous', password: hashedPassword });
      console.log('Anonymous user created');
    } else {
      console.log('Anonymous user already exists');
    }

    return user;
  } catch (error) {
    console.error('Error creating anonymous user:', error);
  }
}
