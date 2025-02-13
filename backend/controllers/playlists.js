let Playlist = require("../models/playlist");
let User = require("../models/user");
let Song = require("../models/song");
const playlist = require("../models/playlist");

module.exports.createPlaylist = async(req, res)=>{
    const { name, thumbnail } = req.body;

    if (!req.user) {
        console.log("User not found in request.");
        return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Authenticated user:", req.user);

    let newPlaylist = new Playlist({
        name, 
        thumbnail,
        owner: req.user._id
    });
    let savedPlaylist = await newPlaylist.save();
    let populatedPlaylist = await Playlist.findById(savedPlaylist._id).populate("owner");
    const playlistToReturn = {...populatedPlaylist.toJSON()}
    res.status(200).json(playlistToReturn);
}


module.exports.myPlaylists = async(req, res)=>{
    try {
        const playlists = await Playlist.find({owner: req.user._id}).populate("owner").populate({
            path:"songs",
            populate:{
                path:"artist"
            }
        });;
        console.log(playlists);
        res.status(200).json({ data: playlists });  // Send the songs data back as a JSON response
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.status(500).json({ error: "Failed to fetch playlists" });  // Handle errors
    }
}

module.exports.getPlaylistByName = async(req, res)=>{
    const playlistName = req.params.playlistName;
    let playlists = await Playlist.find({name: playlistName});
    console.log(playlists);
}

module.exports.addSong = async (req, res) => {
    const { songId, playlistId } = req.body;
    let currUser = req.user;

    try {
        // Fetch playlist and song details
        let playlist = await Playlist.findOne({ _id: playlistId });
        let song = await Song.findOne({ _id: songId });

        // Check if the playlist and song exist
        if (!playlist) {
            return res.status(404).json({ err: "Playlist not found" });
        }
        if (!song) {
            return res.status(404).json({ err: "Song does not exist" });
        }

        // Verify if the current user is authorized to add songs to this playlist
        if (!playlist.owner.equals(currUser._id) && !playlist.collaborators.includes(currUser._id)) {
            return res.status(403).json({ err: "Not allowed" });
        }

        // Check if the song is already in the playlist
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ err: "Song is already in the playlist" });
        }

        // Add the song to the playlist if not already present
        playlist.songs.push(songId);
        let updatedPlaylist = await playlist.save();

        res.status(200).json({ data: updatedPlaylist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ err: "Internal server error" });
    }
};


module.exports.getPlaylistById = async (req, res) => {
    const { playlistId } = req.params;

    try {
        let playlist = await Playlist.findOne({ _id: playlistId }).populate([
            {
                path: "songs",
                populate: {
                    path: "artist",
                },
            },
            {
                path: "owner"
            },
        ]);

        res.status(200).json({ data: playlist });
    } catch (err) {
        res.status(500).json({ error: "Error fetching playlist" });
    }
};


module.exports.getAllPlaylist = async(req, res)=>{
    try{
        const playlists = await Playlist.find().populate("owner");
        console.log(playlists);
        res.status(200).json({data: playlists});
      } catch(error){
        console.log(error);
        res.status(500).json({error: "Failed to get all artists"});
      }
}

module.exports.addToLibrary = async(req, res)=>{
    const { playlistId } = req.params;
    const userId = req.user._id;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        // Check if the playlist is already in myLibrary
        const playlistIndex = user.myLibrary.indexOf(playlistId);

        if (playlistIndex > -1) {
            // If the playlist exists, remove it
            user.myLibrary.splice(playlistIndex, 1);
            await user.save();
            return res.status(200).json({ message: 'Playlist removed from myLibrary.' });
        } else {
            // If the playlist does not exist, add it
            user.myLibrary.push(playlistId);
            await user.save();
            return res.status(200).json({ message: 'Playlist added to myLibrary.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to toggle playlist in myLibrary.' });
    }
}

module.exports.myLibrary = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await User.findById(userId).populate({
            path: "myLibrary",
            populate: {
                path: "owner"
            }
        });
        if (!user) {
            console.log("User not found");
            throw new Error('User not found');
        }
        
        res.status(200).json({ data: user.myLibrary });
    } catch (error) {
        console.error("Error fetching library:", error);
        res.status(500).json({ error: "Failed to fetch library" });
    }
}

module.exports.deleteSong = async (req, res) => {
    const { playlistId, songId } = req.params;
    const userId = req.user._id; // Assuming `req.user` contains the logged-in user's data via Passport.js

    try {
        // Find the playlist and ensure the logged-in user is the owner
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (!playlist.owner.equals(userId)) {
            return res.status(403).json({ message: "You are not authorized to modify this playlist" });
        }

        // Remove the song from the playlist
        playlist.songs = playlist.songs.filter(song => !song.equals(songId));
        await playlist.save();

        res.status(200).json({ message: "Song removed from playlist", playlist });
    } catch (error) {
        console.error("Error deleting song from playlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.deleteMyPlaylist = async (req, res) => {
    const user = req.user;
    const { playlistId } = req.params;

    try {
        // Find the song by ID and ensure the user is authorized to delete it
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        if (playlist.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You do not have permission to delete this playlist." });
        }

        // Delete the playlist
        const deletedPlaylist = await Playlist.findOneAndDelete({ _id: playlistId });

        res.status(200).json({ message: "Playlist deleted successfully.", deletedPlaylist });
    } catch (error) {
        console.error("Failed to delete the song:", error);
        res.status(500).json({ error: "Failed to delete the song" });
    }
};