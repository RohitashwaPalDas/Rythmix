const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/users.js");
const Queue = require("../models/queue.js");
const User = require("../models/user.js");
const Song = require("../models/song.js");
const Artist = require("../models/artist.js");
const History = require("../models/history.js")
const { isLoggedIn, isValidEmail, isArtist } = require("../middleware.js");
const crypto = require('crypto');
const nodemailer = require("nodemailer");


router.post("/signup", isValidEmail, userController.SignUp);
router.put("/profile", isValidEmail, userController.editProfile);
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ err: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Ensure session is saved before sending response
      req.session.save(() => {
        return res.json({ user });
      });
    });
  })(req, res, next);
});


router.get("/myfollowing", isLoggedIn, async (req, res) => {
  try {
    const followings = await User.findById(req.user._id).populate("following");
    res.status(200).json({ data: followings});
} catch (error) {
  console.error("Error fetching playlists:", error);
  res.status(500).json({ error: "Failed to fetch playlists" });  // Handle errors
}})

router.post('/auth/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

router.get('/check-username', async (req, res) => {
  const { username } = req.query;

  // Check if the username exists in the database
  const userExists = await User.findOne({ username });

  if (userExists) {
      return res.status(200).json({ exists: true });
  }

  res.status(200).json({ exists: false });
});


router.post('/is-artist', isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  try {
      const result = await isArtist(userId);
      res.json(result); 
  } catch (error) {
      res.status(500).json({ error: "Server error occurred" });
  }
});

router.post("/logout", userController.LogOut);

router.get('/queue', isLoggedIn, async (req, res) => {
    try {
      const queue = await Queue.findOne({ userId: req.user._id })
            .populate({
                path: 'songs.songId',
                populate: {
                    path: 'artist',
                }
            });
      if (!queue) {
        return res.status(404).send('Queue not found');
      }
      res.status(200).json({data:queue});
    } catch (error) {
      res.status(500).send('Server error');
    }
});

router.post('/queue', isLoggedIn, async (req, res) => {
  try {
      const { songId } = req.body;
      if (!songId) {
          return res.status(400).send('Song ID is required');
      }

      console.log('User ID:', req.user._id);
      let queue = await Queue.findOne({ userId: req.user._id });

      if (!queue) {
          queue = new Queue({ userId: req.user._id, songs: [] });
      }

      queue.songs.push({ songId });
      await queue.save();
      res.json(queue);
  } catch (error) {
      console.error('Error in /queue route:', error);
      res.status(500).send('Server error');
  }
});


router.delete('/queue/:songId', isLoggedIn, async (req, res) => {
    try {
      const { songId } = req.params;
      const queue = await Queue.findOne({ userId: req.user._id });
  
      if (!queue) {
        return res.status(404).send('Queue not found');
      }
  
      queue.songs = queue.songs.filter(song => song.songId.toString() !== songId);
      await queue.save();
      res.json(queue);
    } catch (error) {
      res.status(500).send('Server error');
    }
});

// Endpoint to like a song
router.post('/songs/like', async (req, res) => {
  const userId = req.user._id; 
  const { songId } = req.body;

  try {
    const song = await Song.findById(songId);
    if (!song) return res.status(404).send('Song not found');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Check if the song has been liked already
    if (song.likedBy.includes(userId)) {
      // Dislike logic
      song.likes -= 1;
      song.likedBy = song.likedBy.filter(id => id.toString() !== userId.toString());
      await song.save();

      user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId.toString());
      await user.save();

      res.json({ message: "Song disliked successfully", song });
    } else {
      // Like logic
      song.likes += 1;
      song.likedBy.push(userId);
      await song.save();

      user.likedSongs.push(song._id);
      await user.save();

      res.json({ message: "Song liked successfully", song });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// Endpoint to get liked songs for a user
router.get('/likedSongs', async (req, res) => {
  try {
    let userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "likedSongs",
      populate:{
        path: "artist"
      }
    });
    if (!user) return res.status(404).send('User not found');

    res.json({data: user.likedSongs});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to add song in history
router.post("/addToHistory", async (req, res) => {
  try {
      const { songId } = req.body;
      const userId = req.user._id; // Assuming user is authenticated and req.user contains the logged-in user

      // Find the user
      const user = await User.findById(userId).populate('history');

      // Check if the song is already in the history
      const existingHistoryItem = user.history.find(item => item.song.toString() === songId);

      if (existingHistoryItem) {
          // If the song is already in history, update the lastPlayed time
          existingHistoryItem.lastPlayed = Date.now();
          await existingHistoryItem.save();
      } else {
          // If the song is not in history, create a new history document and add it to the top
          const newHistoryItem = new History({ song: songId, lastPlayed: Date.now() });
          await newHistoryItem.save();
          user.history.unshift(newHistoryItem._id);
      }

      // Save the updated user
      await user.save();

      res.status(200).json({ message: "Song added or updated in history" });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while updating the history" });
  }
}); 





// Endpoint to see history
router.get("/history", async (req, res) => {
  try {
      const userId = req.user._id; // Assuming user is authenticated and req.user contains the logged-in user

      // Find the user and populate the history with song details, sorted by lastPlayed time
      const user = await User.findById(userId)
          .populate({
              path: "history",
              populate: {
                  path: "song",
                  populate: {
                    path: "artist" // Populate the artist field inside song
                  }
              },
              options: { sort: { lastPlayed: -1 } } // Sort by lastPlayed descending
          })
          .exec();

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({data: user.history});
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching the history" });
  }
});

router.post("/registerArtist", async (req, res) => {
  const user = req.user; // Assuming user is authenticated

  try {
    if (user.artistProfile) {
      // User is already an artist, so unregister them
      const artistId = user.artistProfile;

      // Remove artist references before deleting the artist profile
      await Artist.findByIdAndDelete(artistId); // Middleware will clean up references
      await Song.updateMany(
        { artist: artistId },
        { $pull: { artist: artistId } }
      );
      await User.updateMany(
        { following: artistId },
        { $pull: { following: artistId } }
      );

      // Remove the reference from the user
      user.artistProfile = null;
      await user.save();

      return res.status(200).json({ message: "You are no longer registered as an artist." });
    }

    // Create a new artist profile for a non-artist user
    const artist = new Artist({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      profilePic: user.profilePic // Optional: use the same profile pic as user
    });

    await artist.save();

    // Associate the artist profile with the user
    user.artistProfile = artist._id;
    await user.save();

    res.status(200).json({ message: "You are now registered as an artist." });
  } catch (error) {
    console.error("Error in registerArtist:", error);
    res.status(500).json({ error: "Failed to update artist status." });
  }
});



router.get("/artist/:artistName", async (req, res) => {
  const { artistName } = req.params;  // Get the search term from URL parameters
  console.log(artistName);  // Log the search term

  try {
    const artist = await Artist.findOne({
      $or: [
        { firstname: { $regex: artistName, $options: 'i' } },  // 'i' for case-insensitive
        { lastname: { $regex: artistName, $options: 'i' } },
        { username: { $regex: artistName, $options: 'i' } }
      ]
    });

    res.status(200).json({ data: [artist] });
    
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch songs" });  // Handle errors
  }
});


router.get("/artistAcc/:artistId", async (req, res) => {
  const { artistId } = req.params;
  console.log("Received artist id: ", artistId);
  
  try {
    const artist = await Artist.findById(artistId).populate({
      path:"songs",
      populate:{
        path:"artist"
      }
    });
    
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    res.status(200).json({ data: artist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch artist" });
  }
});

router.get("/userAcc/:userId", async(req, res)=>{
  const { userId } = req.params;
  console.log("Received user id: ", userId);
  try {
    const user = await User.findById(userId).populate({
      path:"likedSongs",
      populate:{
        path:"artist"
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
})

//Get all artists
router.get("/allArtists", async(req, res)=>{
  try{
    const artists = await Artist.find();
    res.status(200).json({data: artists});
  } catch(error){
    console.log(error);
    res.status(500).json({error: "Failed to get all artists"});
  }
});

//Follow Artist
router.post('/follow/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const userId = req.user._id;  // Assuming user is authenticated and req.user exists

  try {
      // Find the user and artist
      const user = await User.findById(userId).populate('artistProfile');
      const artist = await Artist.findById(artistId);

      if (!artist) {
          return res.status(404).json({ message: "Artist not found" });
      }

      // Check if user is an artist and trying to follow themselves
      if (user.artistProfile && user.artistProfile.equals(artistId)) {
          return res.status(400).json({ message: "You cannot follow yourself" });
      }

      // Check if the user is already following the artist
      if (user.following.includes(artistId)) {
          return res.status(400).json({ message: "You are already following this artist" });
      }

      // Add artist to user's following list
      user.following.push(artistId);

      // Add user to artist's followers list
      artist.followers.push(userId);

      // Save the updated user and artist
      await user.save();
      await artist.save();

      return res.status(200).json({ message: `You are now following ${artist.firstname} ${artist.lastname}` });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
  }
});

//Unfollow Artist
router.post('/unfollow/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const userId = req.user._id;

  try {
      // Find the user and artist
      const user = await User.findById(userId);
      const artist = await Artist.findById(artistId);

      if (!artist) {
          return res.status(404).json({ message: "Artist not found" });
      }

      // Remove artist from user's following list
      user.following = user.following.filter(followingId => !followingId.equals(artistId));

      // Remove user from artist's followers list
      artist.followers = artist.followers.filter(followerId => !followerId.equals(userId));

      // Save the updated user and artist
      await user.save();
      await artist.save();

      return res.status(200).json({ message: `You have unfollowed ${artist.firstname} ${artist.lastname}` });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
  }
});

//Return own data
router.get('/user/me', (req, res) => {
  try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "User not authenticated" });
      }

      // Return the authenticated user's details
      const user = req.user;

      return res.status(200).json({
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          likedSongs: user.likedSongs,
          history: user.history,
          artistProfile: user.artistProfile,  // Reference to artist profile if exists
          following: user.following,  // List of followed artists
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
  }
});

//Google Login
// Google Login Route
router.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'  // This forces the account selection screen every time
  })
);


// Google Authentication Callback
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with user info
    const user = req.user; // Assuming req.user contains the authenticated user data
    // Redirecting to frontend with the user data encoded in the query string
    res.redirect(`http://localhost:5173/auth/google/success?user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);
  
//Forgot Password
router.post('/forgot-password', async (req, res) => {
  const buf = crypto.randomBytes(20);
  const token = buf.toString('hex');

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ err: "No account with that email found." });
  }

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour // Generate reset token and expiration
  await user.save();  // Save the updated user with the token

  const resetLink = `http://localhost:5173/reset-password/${user.resetPasswordToken}`;

  const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'rohit090505pal@gmail.com',
        pass: 'mfyg ihjl whtg xalz',
      },
      tls: {
        rejectUnauthorized: false,
      },
  });

  const mailOptions = {
      to: user.email,
      from: 'passwordreset@yourdomain.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link, or paste this into your browser to complete the process:
          ${resetLink}
          If you did not request this, please ignore this email and your password will remain unchanged.`
  };

  transporter.sendMail(mailOptions, (err) => {
      if (err) {
          return res.status(500).json({ err: "Error sending email" });
      }
      res.status(200).json({ message: "Reset password link sent to email." });
  });
});

//Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
      return res.status(400).json({ err: "Password reset token is invalid or has expired." });
  }

  user.setPassword(password, async (err) => {
      if (err) {
          return res.status(500).json({ err: "Error resetting password." });
      }

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();
      res.status(200).json({ message: "Password has been reset successfully!" });
  });
});

//Update Password
router.post("/update-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find the authenticated user
  const user = await User.findById(req.user._id);
  if (!user) {
      return res.status(404).send('User not found');
  }

  // Check if old password is correct
  user.authenticate(oldPassword, async (err, authenticatedUser, passwordError) => {
    if (err) {
        return res.status(500).send('Error authenticating user');
    }
    if (!authenticatedUser) {
        return res.status(400).send('Incorrect current password');
    }

      // Set new password
      await user.setPassword(newPassword);
      await user.save();

      req.flash("success", "Password Updated Successfully");
      res.redirect("/user");
  });
});

router.post("/get-artists", async(req, res)=>{
  try {
        const artists = await Artist.find({}, '_id firstname lastname');
        res.status(200).json(artists);
    } catch (error) {
        res.status(500).json({ error: "Error fetching artists." });
    }
});

router.get("/search-artists", async(req, res)=>{
  const { name } = req.query; // Get search term from query
  try {
      const artists = await Artist.find({
          $or: [
              { firstname: { $regex: name, $options: "i" } },
              { lastname: { $regex: name, $options: "i" } }
          ]
      }).limit(10); // Limit results to prevent excessive loading

      res.status(200).json(artists);
  } catch (error) {
      res.status(500).json({ error: "Error fetching artists." });
  }
});



router.post("/deleteUser", userController.deleteUser);

module.exports = router;
