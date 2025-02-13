const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const queueSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [
    {
      songId: {
        type: Schema.Types.ObjectId,
        ref: 'Song',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;
