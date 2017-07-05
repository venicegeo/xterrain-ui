const path = require('path')
const webpack = require('webpack')

const ENVIRONMENT = process.env.NODE_ENV || 'development'

module.exports = {
    devtool: '#source-map',

    entry: './src/main.js',

    output: {
        path: path.resolve(__dirname, 'dist/public'),
        filename: 'build.js',
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.vue$/,
                loader: 'eslint-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loaders: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg|(ttf|eot|woff2?)(\?.*)?)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                },
            },
        ],
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js',
        },
    },

    devServer: {
        contentBase: path.join(__dirname, 'src'),
        proxy: {
            '/api': {
                target: 'http://localhost:3000/',
                pathRewrite: {'^/api': ''},
            }
        },
    },

    performance: {
        hints: false,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENVIRONMENT),
        }),
    ],
}

if (ENVIRONMENT === 'production') {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
            warnings: false,
        },
    }))

    module.exports.plugins.push(new webpack.LoaderOptionsPlugin({
        minimize: true,
    }))
}
