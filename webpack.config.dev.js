/**
 * Created by trzmiel007 on 04/11/16.
 */
require('babel-polyfill');
const path = require('path');
const webpack = require('webpack');
var bundleName = 'do-it.bundle';

module.exports = {
    context: path.resolve(__dirname, "jsxes"),
    devtool: "inline-source-map",
    // devtool: process.env.WEBPACK_DEVTOOL || 'cheap-module-source-map',
    entry: ["./UIcompactor.jsx"],
    output: {
        filename: bundleName+".js",
        chunkFilename: "[name]."+bundleName+".js",
        path: path.join(__dirname, "statics", "js"),
        publicPath: "js/"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components|lib)/,
                loaders: ['babel']
            },
            {
                test: /\.scss$/,
                exclude: /[\/\\](node_modules|bower_components|public)[\/\\]/,
                loaders: ['style?sourceMap', 'css?'+/*minimize&*/'localIdentName=[name]_[local]_[hash:base64:4]', 'postcss', 'sass']
            },
            {
                test: /\.less$/,
                loaders: ["style", "css?minimize", 'postcss', "less"]
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name:      'main', // Move dependencies to our main file
            children:  true, // Look for common dependencies in all children,
            minChunks: 2 // How many times a dependency must come up before being extracted
        })
    ]
};

/// https://github.com/alicoding/react-webpack-babel