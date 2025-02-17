const Artist = require("../models/artist")// Adjust the path as needed
const mongoose = require("mongoose");



const dbURL = "";
console.log(dbURL);

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

const artists = [
    {
        firstname: "Pritam",
        lastname: " ",
        username: "Pritam",
        profilePic: "https://lh3.googleusercontent.com/sjGMYJQ1J3FZEIBsMYUztMjjYOM4-NJ24CjmIHqxTWCxAM1YgjL-d_17u7_PRhTouOwwAjbu-2x5S6I=w544-h544-p-l90-rj"
    },
    
];



async function addArtists() {
    try {
        await Artist.insertMany(artists);
        console.log("artists added successfully");
    } catch (err) {
        console.error("Error adding artists:", err);
    }
}

// Call the function
addArtists();