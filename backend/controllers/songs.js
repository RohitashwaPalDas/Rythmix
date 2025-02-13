let Song = require("../models/song");
let Artist = require("../models/artist");

module.exports.addNewSong = async (req, res) => {
    const user = req.user;

    // Check if the user is an artist by verifying if they have an artist profile
    if (!user.artistProfile) {
        return res.status(403).json({ error: "You must be registered as an artist to add songs." });
    }

    const { name, thumbnail, track } = req.body;

    if (!req.user) {
        console.log("User not found in request.");
        return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Authenticated user:", req.user);

    // Create a new song document with the artist field set to the user's artistProfile ID
    const newSong = new Song({
        name,
        thumbnail,
        track,
        artist: user.artistProfile  // Use the artistProfile ID here
    });

    try {
        // Save the new song document
        let savedSong = await newSong.save();

        // Find the artist profile and update the songs field
        await Artist.findByIdAndUpdate(
            user.artistProfile,  // artistProfile ID
            { $push: { songs: savedSong._id } },  // Push the song ID to the songs array
            { new: true }  // Return the updated document
        );

        const songToReturn = { ...savedSong.toJSON() };
        res.status(200).json(songToReturn);
    } catch (error) {
        console.error("Failed to save the song:", error);
        res.status(500).json({ error: "Failed to save the song" });
    }
};



module.exports.getuserid = async(req, res)=>{
    console.log(req.user);
    res.send("User id");
}


module.exports.mySongs = async (req, res) => {
    try {
        // Check if the user has an artist profile
        if (!req.user.artistProfile) {
            return res.status(403).json({ error: "You must be an artist to view your songs." });
        }

        // Find songs where the artist field matches the artistProfile ID
        const songs = await Song.find({ artist: req.user.artistProfile }).populate("artist");

        console.log(songs);
        res.status(200).json({ data: songs });  // Send the songs data back as a JSON response
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: "Failed to fetch songs" });  // Handle errors
    }
};



module.exports.getSongName = async (req, res) => {
    try {
        let songName = req.params.songName;
        // Create a regex query for partial matching (case-insensitive)
        const regexQuery = new RegExp(songName, 'i'); 
    
        // Find matching songs by name, movieAlbum, or artist's name
        const songs = await Song.find({
            $or: [
                { name: regexQuery },            // Search by song name
                { movieAlbum: regexQuery },      // Search by album name
                {
                    artist: {
                        $in: await Artist.find({ 
                            $or: [
                                { firstname: regexQuery },   // Search by artist's first name
                                { lastname: regexQuery }     // Search by artist's last name
                            ]
                        }).select('_id') // Only fetch the artist IDs
                    }
                }
            ]
        }).populate('artist'); // Populate artist details
        console.log(songs);
        res.json({ data: songs });   // Return matching songs
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch songs" });  // Handle errors
    }
};



module.exports.getSongNameByArtist = async(req, res)=>{
    let artistId = req.params.artistId;
    const songs = await Song.find({artist: artistId});
    console.log(songs);
}

module.exports.deleteMySong = async (req, res) => {
    const user = req.user;
    const { songId } = req.params;

    if (!user.artistProfile) {
        return res.status(403).json({ error: "You must be registered as an artist to delete songs." });
    }

    try {
        // Find the song by ID and ensure the user is authorized to delete it
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        if (!song.artist.includes(user.artistProfile)) {
            return res.status(403).json({ error: "You do not have permission to delete this song." });
        }

        // Delete the song and trigger cleanup middleware
        await Song.findByIdAndDelete(songId);

        // Remove the song from the artist's song list
        await Artist.findByIdAndUpdate(
            user.artistProfile,
            { $pull: { songs: songId } }
        );

        

        res.status(200).json({ message: "Song deleted successfully and removed from all references." });
    } catch (error) {
        console.error("Failed to delete the song:", error);
        res.status(500).json({ error: "Failed to delete the song" });
    }
};
