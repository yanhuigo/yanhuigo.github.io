/**
 * babel编译配置文件
 */
const fs = require('fs')

const presets = [
    "@babel/preset-react",
    "minify"
]

const plugins = ["@babel/plugin-proposal-class-properties"]

console.log('html handle...')
const rootPath = './'
fs.readdir(rootPath, {}, (err, files) => {
    if (err) return;
    let htmlFiles = files.filter(file => file.endsWith(".html"))
    htmlFiles.forEach(html => {
        let file = fs.readFileSync(`${rootPath}${html}`);
        console.log(file.toString());
    });
})



module.exports = { presets, plugins }