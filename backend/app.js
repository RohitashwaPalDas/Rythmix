if(process.env.NODE_ENV != "productiion"){
    require('dotenv').config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const User = require("./models/user");
const users = require("./routes/users.js");
const songs = require("./routes/songs.js");
const playlists = require("./routes/playlists.js");
const api = require("./routes/api.js");
const cors = require('cors');
const multer  = require('multer');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;





const dbURL = process.env.dbURL;
// Database connection
mongoose.connect(dbURL)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error("DB Connection Error:", err));


// Middleware configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true // Allow cookies and credentials to be sent
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.options('*', cors({ origin: 'http://localhost:5173', credentials: true }));


app.use(express.urlencoded({ extended: true }));

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret: process.env.secretKey
    },
    touchAfter: 24 * 3600 // time period in seconds
})

store.on("error", function(e){
    console.log("Session Store Error", e);
})

const sessionOptions = {
    store,
    secret: process.env.secretKey,
    resave: false,
    saveUninitialized: false, // Only save session if something is stored in it
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        // sameSite: "none"
    }
};

app.use(session(sessionOptions));

app.use(flash());



// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const generateUsername = (email) => {
    return email.split('@')[0] + '_' + Date.now();
}

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    scope: ['profile', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile:', profile);
        let user = await User.findOne({ googleId: profile.id });
  
        if (!user) {
            console.log("New User");
            user = new User({
                googleId: profile.id,
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                username: generateUsername(profile.emails[0].value),
                email: profile.emails[0].value
            });
            await user.save();
        } else {
            console.log("Current User");
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
  }
  ));
  

// Routes
app.use("/", users);
app.use("/songs", songs);
app.use("/playlists", playlists);
app.use("/api", api);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/error", (req, res) => {
    res.send("Some error occurred");
});

app.listen(3000, () => {
    console.log("App is listening on port 3000");
});
