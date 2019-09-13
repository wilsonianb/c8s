'use strict';

const Path = require('path');


module.exports = {
    entry: {
        app: './src/public/app.js',
        proxy: './src/public/proxy.js',
    },
    // mode: 'production',
    mode: 'development',
    resolve: {
        extensions: ['.js']
    },
    output: {
        path: Path.resolve(__dirname),
        filename: './src/public/assets/[name].bundle.js'
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
