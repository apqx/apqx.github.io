const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const Package = require("./package.json");
const version = Package.version;

const config = {
    mode: "",
    // 打包入口
    entry: {
        font: {
            import: "./src/component/font/font.scss",
        },
        scaffold: {
            import: ["./src/page/scaffold.ts", "./src/page/scaffold.scss",
                "./node_modules/long-press-event/src/long-press-event.js"]
        },
        index: {
            import: ["./src/page/index.ts", "./src/page/index.scss"],
            dependOn: "scaffold"
        },
        post: {
            import: ["./src/page/post.ts", "./src/page/post.scss"],
            dependOn: "scaffold"
        },
        404: {
            import: ["./src/page/404.ts", "./src/page/404.scss"],
            dependOn: "scaffold"
        }
    },
    optimization: {
        // splitChunks: {
        //     chunks: "all",
        // },
        // 验证是否还需要设置这个，应该需要？？？？
        runtimeChunk: "single",
    },
    output: {
        // 指定要生成的js文件名
        filename: `blog-[name]-v${version}.js`,
        path: path.resolve(__dirname, "dist"),
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

module.exports = (env, argv) => {
    if (env.isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
    }
    return config;
};
