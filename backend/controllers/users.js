let User = require("../models/user");
const Artist = require("../models/artist");
const { v4: uuidv4 } = require('uuid');

async function generateUniqueGoogleId() {
    let googleId = uuidv4(); // Generate a UUID v4

    // Check if the generated googleId already exists in the database (optional check)
    let userExists = await User.findOne({ googleId });

    // If the generated googleId exists (collision case), generate a new one
    while (userExists) {
        googleId = uuidv4();  // Generate a new one
        userExists = await User.findOne({ googleId });
    }

    return googleId;
}

module.exports.SignUp= async(req, res)=>{
    try{
        console.log(req.body);
        let {firstname, lastname, username, email, password} = req.body;
        const googleId = await generateUniqueGoogleId();
        const newUser = new User({email, username, firstname, lastname, googleId});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            const userToReturn = {...registeredUser.toJSON()}
            res.status(200).json(userToReturn);
        })
    } catch(err){
        console.error(err);
        res.status(500).json({message: "Failed to register user", error: err.message});
    }
}


module.exports.LogIn = async(req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(400).json({ error: req.flash("error") });
    }
};

module.exports.LogOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        console.log("Logged Out");
        res.status(200).json({ message: "Logged Out" }); // Send a response to the client
    });
};

module.exports.editProfile = async (req, res) => {
    try {
        const id = req.user._id;

        // Update user details
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        // Check if the user has an artist profile
        if (updatedUser.artistProfile) {
            // Update the associated artist profile
            const artistId = updatedUser.artistProfile;
            const artistUpdateData = {};

            // Map updated user fields to the artist profile
            if (req.body.firstname) artistUpdateData.firstname = req.body.firstname;
            if (req.body.lastname) artistUpdateData.lastname = req.body.lastname;
            if (req.body.username) artistUpdateData.username = req.body.username;
            if (req.body.profilePic) artistUpdateData.profilePic = req.body.profilePic;

            await Artist.findByIdAndUpdate(
                artistId,
                artistUpdateData,
                { new: true, runValidators: true }
            );
        }

        const userToReturn = { ...updatedUser.toJSON() };
        res.status(200).json(userToReturn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
};

module.exports.deleteUser = async (req, res, next) => {
    const userId = req.body.userId; // Assume userId is sent in the request body

    try {
        const deletedUser = await mongoose.model("User").findOneAndDelete({ _id: userId });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`User with ID ${userId} has been deleted successfully.`);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        next(err); // Pass the error to the next middleware for handling
    }
};
