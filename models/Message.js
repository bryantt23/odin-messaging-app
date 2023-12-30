const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const messageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Explicitly set to null when not used
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
