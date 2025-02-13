const User = require("./models/user.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("User is logged in:", req.user);
    next();
};

module.exports.isValidEmail = async(req, res, next)=>{
    let {email} = req.body;
    let apiKey = "ema_live_UwmTkfwZJZFc32LXjdoQ0kdJ15nDSIijnYBLq3W2";
    let url = `https://api.emailvalidation.io/v1/info?apikey=${apiKey}&email=${email}`;
    let response = await fetch(url);
    let result = await response.json();
    console.log(result.smtp_check);
    let validEmail = result.smtp_check;
    if(validEmail !== true){
        return res.status(401).json({ error: "Invalid Email" });
    }else{
        next();
    }
}

module.exports.isArtist = async(userId)=>{
    try {
        // Find the user by ID and populate the artistProfile field
        const user = await User.findById(userId).populate('artistProfile');
        
        // Check if artistProfile is populated
        if (user && user.artistProfile) {
            return {
                isArtist: true,
                artistProfile: user.artistProfile
            };
        } else {
            return { isArtist: false };
        }
    } catch (err) {
        console.error("Error checking user artist status:", err);
        return { isArtist: false, error: err.message };
    }
}