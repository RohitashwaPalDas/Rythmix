const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Store temporary tokens in memory (use Redis or a database for scalability in production)
const temporaryTokens = new Map();

// Generate a temporary token (valid for 5 minutes)
router.get('/generate-token', (req, res) => {
    const allowedOrigin = 'https://rythmix-sbzw.onrender.com/'; // Replace with your frontend's URL

    const origin = req.headers.origin || req.headers.referer;
    if (!origin || !origin.startsWith(allowedOrigin)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const token = crypto.randomBytes(32).toString('hex'); // Generate a random token
    const expiration = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store the token with its expiration time
    temporaryTokens.set(token, expiration);

    res.status(200).json({ token: token });
});

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const expiration = temporaryTokens.get(token);

    console.log("Token received:", token);
    console.log("Token expiration time:", expiration);

    if (!token || !expiration || Date.now() > expiration) {
        console.error("Token verification failed");
        return res.status(403).json({ message: 'Forbidden or token expired' });
    }

    next();
};


// Protect the /config endpoint
router.get('/config', verifyToken, (req, res) => {
    res.json({
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        cloudPwd: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
    });
});

module.exports = router;
