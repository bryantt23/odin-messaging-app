const bcrypt = require('bcrypt');
const User = require('../models/User'); // Update the path as per your project structure
require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await createAnonymousUser();
  })
  .catch(err => {
    console.error('Database connection error', err);
  });

async function createAnonymousUser() {
  try {
    let user = await User.findOne({ name: 'anonymous' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password', 10);
      user = await User.create({ name: 'anonymous', password: hashedPassword });
      console.log('Anonymous user created');
    } else {
      console.log('Anonymous user already exists');
    }
  } catch (error) {
    console.error('Error creating anonymous user:', error);
  }
}

// Optional: Handle graceful shutdown
process.on('SIGINT', () => {
  mongoose.disconnect().then(() => {
    console.log('Disconnected from MongoDB');
    process.exit(0);
  });
});
