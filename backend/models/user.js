const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    email: {
        type: String,
        required: true,
        // unique: true,
    },
    googleId: {
        type: String,
        unique: false,
        default: null
    },
    profilePic: {
        type: String,
    },
    likedSongs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'History'
    }],
    artistProfile: {  // Reference to an artist profile if user is an artist
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date
    },
    myLibrary: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    }]
});

userSchema.plugin(passportLocalMongoose);

userSchema.pre("findOneAndDelete", async function (next) {
    try {
        const userId = this.getQuery()._id; // Get the user ID from the query

        // Find the user being deleted
        const user = await mongoose.model("User").findById(userId);

        if (!user) {
            return next(); // If the user is not found, skip the middleware
        }

        // If the user has an associated artist profile
        if (user.artistProfile) {
            const artistId = user.artistProfile;

            // Delete the artist profile
            const artist = await mongoose.model("Artist").findByIdAndDelete(artistId);

            if (artist && artist.songs.length > 0) {
                // Delete all songs related to the artist profile
                await mongoose.model("Song").deleteMany({ _id: { $in: artist.songs } });
            }

            // Remove the artist from other users' following lists
            await mongoose.model("User").updateMany(
                { following: artistId },
                { $pull: { following: artistId } }
            );
        }

        // Remove the user from followers of all artists
        await mongoose.model("Artist").updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );

        // Remove the user's likes from all songs
        await mongoose.model("Song").updateMany(
            { likedBy: userId },
            { $pull: { likedBy: userId } }
        );

        // Delete the user's playlists
        const userPlaylists = await mongoose.model("Playlist").find({ owner: userId });
        for (const playlist of userPlaylists) {
            await mongoose.model("Playlist").findByIdAndDelete(playlist._id);
        }

        // Remove user references in playlists as collaborators
        await mongoose.model("Playlist").updateMany(
            { collaborators: userId },
            { $pull: { collaborators: userId } }
        );

        // Remove the user's history entries
        await mongoose.model("History").deleteMany({ _id: { $in: user.history } });

        // Remove the user from other users' following lists
        await mongoose.model("User").updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );

        console.log(`User with ID ${userId} and associated data has been cleaned up.`);
        next();
    } catch (err) {
        console.error("Error during user deletion cleanup:", err);
        next(err); // Pass the error to the next middleware
    }
});

userSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $ne: null } } });




module.exports = mongoose.model("User", userSchema);
