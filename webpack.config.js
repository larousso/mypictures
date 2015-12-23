require('babel/polyfill');

// Webpack config for creating the production bundle.
var path = require('path');
var webpack = require('webpack');


var config = {
    watch: true,

    debug: true,
    entry: {
        client : path.resolve(__dirname, 'src/client.js'),
    },
    devtool: 'eval-source-map',
    module: {

        loaders: [
            {test: /\.js?$/, exclude: /node_modules/, loaders: ['babel?stage=0&optional=runtime']}
        ]
    },
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.es6']
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ]
};

module.exports = config;