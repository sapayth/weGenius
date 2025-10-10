const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
	entry: {
		'dashboard': './src/js/dashboard.js',
		'settings': './src/js/settings.js',
		'posts-page': './src/js/posts-page.js',
		'editor': './src/editor/WeGeniusActions.js',
	},
	output: {
		path: path.resolve(__dirname, 'assets/js'),
		filename: '[name].js',
		clean: true,
	},
	watchOptions: {
		ignored: /node_modules/,
		aggregateTimeout: 300,
		poll: 1000,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { targets: { node: 'current' } }],
							['@babel/preset-react', { runtime: 'automatic' }],
						],
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
				],
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '../css/[name].css',
		}),
		new DependencyExtractionWebpackPlugin({
			outputFilename: '[name].asset.php',
		}),
	],
	externals: {
		'@wordpress/element': 'wp.element',
		'@wordpress/components': 'wp.components',
		'@wordpress/i18n': 'wp.i18n',
		'@wordpress/api-fetch': 'wp.apiFetch',
		'@wordpress/data': 'wp.data',
		'@wordpress/hooks': 'wp.hooks',
		'@wordpress/url': 'wp.url',
		'@wordpress/dom-ready': 'wp.domReady',
		'@wordpress/plugins': 'wp.plugins',
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
	mode: process.env.NODE_ENV || 'development',
	stats: {
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
	},
};
