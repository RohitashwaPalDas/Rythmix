const Joi = require("joi");

module.exports.userSchema = Joi.object({
    user: Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().required(),
    }).required(),
});

module.exports.songSchema = Joi.object({
    song: Joi.object({
        name: Joi.string().required(),
        thumbnail: Joi.string().required(),
        track: Joi.string().required(),
    }).required(),
});

module.exports.playlistSchema = Joi.object({
    playlist: Joi.object({
        name: Joi.string().required(),
        thumbnail: Joi.string().required(),
    }).required(),
});