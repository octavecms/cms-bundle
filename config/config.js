// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/*
 * Task configuration
 * All options will be merged with defaults, but not replaces whole configuration object
 *
 * Default configuration can be seen here https://github.com/videinfra/static-website-builder/tree/master/tasks
 * in each tasks config.js file
 */

exports.clean = {};
exports.static = {};
exports.html = {};
exports.data = {};
exports.fonts = {};
exports.icons = {};
exports.images = {};
exports.stylesheets = {};
exports.browserSync = {};
exports.sizereport = {};

exports.javascripts = {
    webpack: {
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        name: 'vendor',
                        test: /([\\/]node_modules[\\/]|components[\\/]form[\\/]tinycme)/,
                        priority: 10,
                        enforce: true,
                        chunks: 'all',
                    }
                }
            }
        },
        plugins: [
            // new BundleAnalyzerPlugin()
        ]
    }
};

exports.plugins = [
    // Enables SASS engine and .sass and .scss file compilation
    require('@videinfra/static-website-builder/plugins/sass'),

    // Enables TwigJS engine .twig file compilation
    require('@videinfra/static-website-builder/plugins/twig'),
];


/*
 * Path configuration
 * All options will be merged with defaults, but not replaces whole configuration object
 *
 * Default configuration can be seen here https://github.com/videinfra/static-website-builder/tree/master/tasks
 * in each tasks config.js file
 */

exports.paths = {
    src: './src',
    dest: './public',
};
