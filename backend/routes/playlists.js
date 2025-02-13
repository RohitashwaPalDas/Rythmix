const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlists.js");
const { isLoggedIn } = require("../middleware.js");

//Create a new Playlist
router.post("/newplaylist", isLoggedIn, playlistController.createPlaylist);

//Get your own playlist
router.get("/myPlaylist", isLoggedIn, playlistController.myPlaylists);

//Add a song to a playlist
router.post("/addSong", playlistController.addSong);

//Get Playlist by playlistId
router.get("/get/:playlistId", playlistController.getPlaylistById);

//Get All Playlists
router.get("/allPlaylists", playlistController.getAllPlaylist);

//Get your own libraries
router.get("/myLibrary", isLoggedIn, playlistController.myLibrary);

//Get playlist by playlist name
router.get("/:playlistName", playlistController.getPlaylistByName);

//Add playlist to User Library Section
router.post("/addToLibrary/:playlistId", playlistController.addToLibrary);

//Delete song from own playlist
router.delete("/:playlistId/songs/:songId", playlistController.deleteSong);

//Delete my own playlist
router.delete("/myplaylist/:playlistId", playlistController.deleteMyPlaylist);

module.exports = router;