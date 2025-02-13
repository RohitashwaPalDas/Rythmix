const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const historySchema = new Schema({
    song: {
        type: Schema.Types.ObjectId,
        ref: 'Song'
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("History", historySchema);