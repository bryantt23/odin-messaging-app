const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');

require('dotenv').config();
// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// GET route to fetch messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ createdAt: 1 })
      .populate('userId', 'name'); // Populate name field from User model

    res.json(
      messages.map(message => ({
        ...message.toObject(),
        username: message.userId.name // Assuming 'name' is a field in User model
      }))
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
});

app.post('/messages', async (req, res) => {
  try {
    const anonymousUser = await User.findOne({ name: 'anonymous' });

    if (!anonymousUser) {
      return res.status(404).send('Anonymous user not found');
    }
    // Create a new message with the anonymous user as the author
    const newMessage = new Message({
      userId: anonymousUser._id,
      content: req.body.content // Assuming the message content is sent in the request body
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).send('Error posting message');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
