const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isProduction = process.env.NODE_ENV === 'production';

const Package = require('./package.json');
const version = Package.version;

const config = {
    mode: '',
    // 打包入口
    entry: {
        font: "./src/style/font.scss",
        main: ['./src/style/main.scss', './src/script/main.ts',
            './node_modules/long-press-event/src/long-press-event.js']
    },
    output: {
        // 指定要生成的js文件名
        filename: `blog-[name]-v${version}.js`,
    },
    resolve: {
        // 指定webpack要处理的文件类型，如果这里不指定.ts等，在打包时会找不到除入口文件之外的该类型文件
        extensions: [".tsx", ".ts", ".js", ".json"],
        fallback: {"https": false}
    },
    plugins: [new MiniCssExtractPlugin({
        filename: `blog-[name]-v${version}.css`
    })],
    module: {
        rules: [
            // 支持ES2015、Typescript、React，扩展名.js/.jsx/.ts/.tsx
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            // 支持CSS(.css)
            {
                test: /\.(css)$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            // 支持Sass(.scss)
            {
                test: /\.(s(a|c)ss)$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};