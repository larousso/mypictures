require('babel/polyfill');

// Webpack config for creating the production bundle.
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var config = {
    entry: {
        client : path.resolve(__dirname, 'src/client.js'),
        css: path.resolve(__dirname, 'src/styles/mypictures.scss')
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loaders: ['babel']
            },
            // LESS
            {
                test: /\.less$/,
                loader: 'style!css!less'
            },

            // SASS
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader?sourceMap!sass-loader?sourceMap=true&sourceMapContents=true')
            }
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
        new webpack.NoErrorsPlugin(), new ExtractTextPlugin('styles.css'),
        new webpack.DefinePlugin({
            __NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
            __CLIENT__: true,
            __SERVER__: false
        })
    ]
};

module.exports = config;