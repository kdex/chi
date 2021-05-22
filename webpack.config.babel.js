import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
const { NODE_ENV } = process.env;
const mode = NODE_ENV || "development";
const dev = mode === "development";
const common = {
	cache: true,
	mode,
	module: {
		rules: [{
			exclude: path.resolve("node_modules"),
			test: /\.js$/,
			use: "babel-loader"
		}]
	},
	plugins: [].concat(dev
		? []
		: [
			new webpack.optimize.OccurrenceOrderPlugin(),
			new TerserPlugin()
		]
	),
	watch: false
};
const chi = {
	entry: {
		index: "./src/language/index"
	},
	output: {
		libraryTarget: "var",
		library: "chi"
	},
	resolve: {
		fallback: {
			util: false
		}
	},
	target: "web"
};
const cli = {
	entry: {
		cli: "./src/cli/index"
	},
	output: {
		libraryTarget: "umd"
	},
	target: "node"
};
export default [
	Object.assign({}, common, chi),
	Object.assign({}, common, cli)
];