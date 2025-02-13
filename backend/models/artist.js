const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    profilePic: {
        type: String,
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

artistSchema.plugin(passportLocalMongoose);

// Post middleware to clean up references after artist deletion
artistSchema.post('findOneAndDelete', async function (deletedArtist, next) {
    if (!deletedArtist) return next(); // If no artist was deleted, skip.

    try {
        const artistId = deletedArtist._id;

        // Remove artist reference from users' following lists
        await mongoose.model('User').updateMany(
            { following: artistId },
            { $pull: { following: artistId } }
        );

        // Remove songs associated with the artist
        const Song = mongoose.model('Song');
        const deletedSongs = await Song.deleteMany({ artist: artistId });

        console.log(`Deleted ${deletedSongs.deletedCount} songs for artist with ID: ${artistId}`);

        // Optionally, log the cleanup operation
        console.log(`Cleaned up references for artist with ID: ${artistId}`);
        next();
    } catch (error) {
        console.error("Error during artist deletion cleanup:", error);
        next(error);
    }
});

module.exports = mongoose.model("Artist", artistSchema);
