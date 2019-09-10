'use strict';

const Path = require('path');


module.exports = {
    entry: Path.join(__dirname, './src/public/client.js'),
    // mode: 'production',
    mode: 'development',
    resolve: {
        extensions: ['.js']
    },
    output: {
        path: Path.resolve(__dirname),
        filename: './src/public/assets/client.js'
    // },
    // module: {
    //     rules: [{
    //         test: /\.jsx$/,
    //         loader: 'babel-loader',
    //         query: {
    //             presets: ['react', 'env']
    //         }
    //     }]
    }
};
