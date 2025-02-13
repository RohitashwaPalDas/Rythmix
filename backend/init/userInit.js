const User = require("../models/user")// Adjust the path as needed
const mongoose = require("mongoose");


const MONGO_URL = "mongodb+srv://rohitashwapaldas:0yuOzBGcw4BvEYtr@cluster0.akhon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

const users = [
    {
        firstname: "Rythmix",
        lastname: "",
        username: "rythmix",
        email: "rythmix@gmail.com",
        profilePic: "https://res.cloudinary.com/dbztqrvks/image/upload/v1738178667/logo3_o0pc9k.jpg",
        googleId: ""
    }
]

async function addUsers() {
    try {
        await User.insertMany(users);
        console.log("users added successfully");
    } catch (err) {
        console.error("Error adding users:", err);
    }
}

// Call the function
addUsers();