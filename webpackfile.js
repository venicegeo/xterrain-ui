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

        // Reference: https://webpack.js.org/configuration/dev-server/

        contentBase: path.join(__dirname, 'src'),
        proxy: {

            // References: https://webpack.js.org/configuration/dev-server/#devserver-proxy
            //             https://github.com/chimurai/http-proxy-middleware#http-proxy-options

            // FIXME -- Restore this when new API architecture comes online
            // '/api': {
            //     target: 'http://xterrain-api.dev.dev.east.paas.geointservices.io/',
            //     changeOrigin: true,
            //     pathRewrite: {'^/api': ''},
            // },

            '/api': { target: 'http://localhost:3001/' },
            '/auth': { target: 'http://localhost:3001/' },
            '/wms': { target: 'http://localhost:8080/geoserver/wms', pathRewrite: { '^/wms': '' } },

            '/basemaps': {
                target: '-',
                changeOrigin: true,
                ignorePath: true,
                router(req) {
                    const segments = req.url.split('/')
                    const path_ = segments.slice(3).join('/')
                    switch (segments[2]) {
                    case 'dark': return `http://a.basemaps.cartocdn.com/dark_all/${path_}`
                    case 'light': return `http://a.basemaps.cartocdn.com/light_all/${path_}`
                    case 'osm': return `https://osm.geointservices.io/osm_tiles/${path_}`
                    case 'aerial': return `https://api.mapbox.com/v4/mapbox.satellite/${path_}?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg`
                    case 'road': return `https://api.mapbox.com/v4/mapbox.outdoors/${path_}?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg`
                    }
                },
            },
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
