const Dotenv = require('dotenv-webpack');

module.exports = {
    // Other Webpack configuration options
    plugins: [
        new Dotenv(),
        // Other plugins
    ],
    // Ensure other configurations like entry, output, and module rules are properly defined
};
