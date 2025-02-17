const Playlist = require('../models/playlist'); // Adjust the path as needed
const mongoose = require("mongoose");
const USer = require("../models/user.js");


const dbURL = "";

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbURL);
}

const examplePlaylists = [
    {
        name: "Kalank",
        thumbnail: "https://i.scdn.co/image/ab67616d0000b2739eb6c1861d8c058e7052df1e",
        songs: [
            new mongoose.Types.ObjectId("679e65d97a9b330717e3b3d1"),
            new mongoose.Types.ObjectId("679e65d97a9b330717e3b3d2"),
            new mongoose.Types.ObjectId("679e65d97a9b330717e3b3d3"),
            new mongoose.Types.ObjectId("679e65d97a9b330717e3b3d4"),
        ],
    },
];

async function addSongs() {
    try {
        await Playlist.insertMany(examplePlaylists);
        console.log("Example playlist added successfully");
    } catch (err) {
        console.error("Error adding playlist:", err);
    }
}

// Call the function
addSongs();
