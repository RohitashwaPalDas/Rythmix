const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name:{
        type: String,
        required: true,
    },

    thumbnail:{
        type: String,
        required: true,
    },

    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: new mongoose.Types.ObjectId("679a80b71819be4213848b3c")
    },

    songs:[
        {
            type: Schema.Types.ObjectId,
            ref: "Song"
        }
    ],

    collaborators:[
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

playlistSchema.pre("findOneAndDelete", async function (next) {
    try {
        const playlistId = this.getQuery()._id; // Get the playlist ID from the query

        // Remove the playlist from the `myLibrary` array of all users
        await mongoose.model("User").updateMany(
            { myLibrary: playlistId },
            { $pull: { myLibrary: playlistId } }
        );

        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Playlist", playlistSchema);