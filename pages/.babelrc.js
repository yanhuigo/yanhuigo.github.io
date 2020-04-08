/**
 * babel编译配置文件
 */

const presets = [
    "@babel/preset-react",
    "minify"
];
const plugins = ["@babel/plugin-proposal-class-properties"];

if (process.env["ENV"] === "prod") {
    console.log("prod")
}

module.exports = { presets, plugins };