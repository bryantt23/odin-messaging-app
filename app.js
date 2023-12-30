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
  // Join the user to the group chat room
  socket.join('groupChatRoom');

  // Join the user to a room with their username
  socket.on('joinPrivateRoom', ({ username }) => {
    console.log(`User joined private room: ${username}`);
    socket.join(username);
  });

  // Handle group chat messages
  socket.on('groupMessage', message => {
    // Save message to database if needed
    console.log('Group message received:', message);
    io.to('groupChatRoom').emit('newGroupMessage', message);
  });

  // Handle private messages
  socket.on('privateMessage', ({ content, sender, recipient }) => {
    // Save the message to the database, similar to your POST /messages route logic
    // Emit the message to the recipient's room
    const privateMessage = { content, sender, recipient };
    console.log(
      '🚀 ~ file: app.js:58 ~ socket.on ~ content, sender, recipient :',
      content,
      sender,
      recipient
    );

    io.to(recipient).emit('newPrivateMessage', privateMessage);
    // Emit to the sender
    io.to(sender).emit('newPrivateMessage', privateMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/messages', async (req, res) => {
  try {
    // Extract query parameters
    const { user, userName } = req.query;

    let query = {};

    // If user and userName are provided, adjust the query to fetch specific messages
    if (user && userName) {
      // Find user IDs based on names
      const users = await User.find({
        name: { $in: [user, userName] }
      });

      const userIds = users.map(u => u._id);

      if (userIds.length === 2) {
        // Construct query to fetch messages between the two users
        query = {
          $or: [
            { userId: userIds[0], recipientId: userIds[1] },
            { userId: userIds[1], recipientId: userIds[0] }
          ]
        };
      } else {
        // If both users are not found, return an empty array
        return res.json([]);
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('userId', 'name')
      .populate('recipientId', 'name');

    res.json(
      messages.map(message => ({
        ...message.toObject(),
        username: message.userId.name,
        recipientName: message.recipientId ? message.recipientId.name : null
      }))
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
});

app.post('/messages', async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    let recipientId = null;

    // Check if recipientUsername is provided
    if (req.body.recipientUsername) {
      const recipient = await User.findOne({
        name: req.body.recipientUsername
      });
      if (!recipient) {
        return res.status(404).send('Recipient user not found');
      }
      recipientId = recipient._id;
    }

    // Extract username from the decoded token
    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }
    // Create a new message with the user as the author
    const newMessage = new Message({
      userId: user._id,
      recipientId, // This will be null for group messages
      content: req.body.content // Assuming the message content is sent in the request body
    });

    await newMessage.save();
    const messageObject = newMessage.toObject();

    // Check if it's a group message or a private message
    if (!recipientId) {
      // Group message: Emit to group chat room
      messageObject.username = user.name;
      io.to('groupChatRoom').emit('newGroupMessage', messageObject);
    } else {
      // Private message: Emit to both the sender and recipient
      io.to(user.name).emit('newPrivateMessage', messageObject);
      io.to(req.body.recipientUsername).emit(
        'newPrivateMessage',
        messageObject
      );
    }

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
  const token = jwt.sign(
    { userId: user._id, name: user.name },
    process.env.SECRET_KEY
  );
  res.json({ token });
});
/*
TODO
requirements - 
x group chat 
x ui shows chat 
x if user is not logged in then have a link that says "register or log in to join the chat" otherwise show the chat form
x have register & login pages, both redirect to chat
x make sure the chat shows the correct poster of the new message
x have a log out 
x have the header say home, login/register or logout

x add login api & page
x register api & page

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
