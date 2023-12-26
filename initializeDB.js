const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Assuming you have a User model defined as previously discussed
const Message = require('./models/Message'); // Assuming you have a Message model defined as previously discussed
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
    initializeDatabase();
  })
  .catch(err => {
    console.error('Database connection error', err);
  });

async function initializeDatabase() {
  try {
    // Hash passwords
    const password1 = await bcrypt.hash('user1password', 10);
    const password2 = await bcrypt.hash('user2password', 10);

    // Create users
    const user1 = await User.create({ name: 'User1', password: password1 });
    const user2 = await User.create({ name: 'User2', password: password2 });

    // Create messages
    await Message.create({ userId: user1._id, content: 'Hello from User1!' });
    await Message.create({ userId: user2._id, content: 'Hello from User2!' });

    console.log('Database initialized with two users and two messages');
  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    mongoose.disconnect();
  }
}
