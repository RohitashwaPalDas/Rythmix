const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    track: {
        type: String,
        required: true,
    },
    movieAlbum: {
        type: String,
    },
    artist: [{
        type: Schema.Types.ObjectId,
        ref: "Artist"
    }],
    likes: { 
        type: Number, 
        default: 0 
    },
    likedBy: [{
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }]
});

// Post middleware for deleteOne or deleteMany
songSchema.post('findOneAndDelete', async function (deletedSong, next) {
    if (!deletedSong) return next(); // If no song was deleted, skip.

    try {
        const songId = deletedSong._id;

        // Remove song from all users' `likedSongs`
        await mongoose.model('User').updateMany(
            { likedSongs: songId },
            { $pull: { likedSongs: songId } }
        );

        // Remove song entries from users' history
        const histories = await mongoose.model('History').find({ song: songId });
        const historyIds = histories.map(history => history._id);
        if (historyIds.length > 0) {
            await mongoose.model('History').deleteMany({ _id: { $in: historyIds } });
        }

        // Remove song from all playlists
        await mongoose.model('Playlist').updateMany(
            { songs: songId },
            { $pull: { songs: songId } }
        );

        console.log(`Cleaned up data related to deleted song with ID: ${songId}`);
        next();
    } catch (error) {
        console.error("Error during song deletion cleanup:", error);
        next(error);
    }
});



module.exports = mongoose.model("Song", songSchema);
