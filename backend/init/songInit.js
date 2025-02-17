const Song = require('../models/song.js'); // Adjust the path as needed
const Artist = require('../models/artist.js'); // Adjust the path as needed
const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/rythmix";
const DB_URL = ""

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(DB_URL);
}

const exampleSongs = [
  {
    name: "Kalank - Title Track",
    thumbnail: "https://i.scdn.co/image/ab67616d0000b2739eb6c1861d8c058e7052df1e",
    track: "https://res.cloudinary.com/dbztqrvks/video/upload/v1738175222/Kalank_-Title_Track_agf5yl.mp3",
    artist: [
      new mongoose.Types.ObjectId("679b9bb47e769f2a80948817"),
      new mongoose.Types.ObjectId("6780c9498826f404b743de99")
    ],
    movieAlbum: "Kalank",
  },

  {
    name: "First Class",
    thumbnail: "https://i.scdn.co/image/ab67616d0000b2739eb6c1861d8c058e7052df1e",
    track: "https://res.cloudinary.com/dbztqrvks/video/upload/v1738175231/First_Class_kuh3rt.mp3",
    artist: [
      new mongoose.Types.ObjectId("679b9bb47e769f2a80948817"),
      new mongoose.Types.ObjectId("6780c9498826f404b743de99"),
      new mongoose.Types.ObjectId("679a7782386e09309a3c0446")
    ],
    movieAlbum: "Kalank",
  },

  {
    name: "Ghar More Pardesiya",
    thumbnail: "https://i.scdn.co/image/ab67616d0000b2739eb6c1861d8c058e7052df1e",
    track: "https://res.cloudinary.com/dbztqrvks/video/upload/v1738175221/Ghar_More_Pardesiya_lzwulm.mp3",
    artist: [
      new mongoose.Types.ObjectId("679b9bb47e769f2a80948817"),
      new mongoose.Types.ObjectId("6780c9498826f404b743de9a")
    ],
    movieAlbum: "Kalank",
  },

  {
    name: "Tabaah Ho Gaye",
    thumbnail: "https://i.scdn.co/image/ab67616d0000b2739eb6c1861d8c058e7052df1e",
    track: "https://res.cloudinary.com/dbztqrvks/video/upload/v1738175226/Tabah_Ho_Gaye_sgihnx.mp3",
    artist: [
      new mongoose.Types.ObjectId("679b9bb47e769f2a80948817"),
      new mongoose.Types.ObjectId("6780c9498826f404b743de9a")
    ],
    movieAlbum: "Kalank",
  },

];

async function addSongs() {
  try {
    // Insert the song
    const insertedSongs = await Song.insertMany(exampleSongs);
    console.log("Example songs with multiple artists added successfully");

    // Update each artist's songs field with the newly inserted song IDs
    for (const song of insertedSongs) {
      const artistIds = song.artist; // Get the artist IDs from the song

      for (const artistId of artistIds) {
        // Add the song to each artist's songs array
        await Artist.findByIdAndUpdate(
          artistId,
          { $push: { songs: song._id } }, // Push the song ID into the artist's songs field
          { new: true } // Return the updated document
        );
      }
    }

    console.log("Artist data updated with corresponding songs");
  } catch (err) {
    console.error("Error adding example songs and updating artist data:", err);
  }
}

// Call the function
addSongs();
