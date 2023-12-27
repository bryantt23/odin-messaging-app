const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();
// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
    // TODO use logged in user
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
    const messageObject = newMessage.toObject();
    // Emit the new message to all connected clients
    io.emit('newMessage', { ...messageObject, username: 'anonymous' });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).send('Error posting message');
  }
});

//user login route
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  // Find user by name
  const user = await User.findOne({ name });
  if (!user) {
    return res.status(401).send('Authentication failed');
  }

  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).send('Authentication failed');
  }

  // Generate and return JWT
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
  res.json({ token });
});
/*
TODO
requirements - group chat
ui shows chat
if user is not logged in then have a link that says "register or log in to join the chat" otherwise show the chat form
have register & login pages, both redirect to chat
make sure the chat shows the correct poster of the new message
have a log out 
have the header say home, login/register or logout

add login api & page
register api & page

requirements - individual chat
group chat shows all of the users
  all are hyper links except for the logged in
  if not logged in none are hyperlinks

hyperlink leads to chat with the two
how to structure the message?
i am thinking it needs an id which is either group or has the 2 people, i will research 
this page will have a go back to group chat
*/

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
