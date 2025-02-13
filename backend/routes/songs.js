const express = require("express");
const router = express.Router();
const songController = require("../controllers/songs.js");
const { isLoggedIn } = require("../middleware.js");

//Create a new song
router.post("/newsong", isLoggedIn, songController.addNewSong);

//Get the current user's song
router.get("/mysongs", isLoggedIn, songController.mySongs);

//Get a song by song name
router.get("/song/:songName", songController.getSongName);

//Get a song by artist name
router.get("/artist/:artistId", songController.getSongNameByArtist);

//Delete your own song
router.delete("/mysong/:songId", songController.deleteMySong);

module.exports = router;
