const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'development',
    // 打包入口
    entry: ['./scss/app.scss', './js/app.js', './js/tag.js', './js/img.js', './js/nav.js', './js/jump.js',
        './node_modules/long-press-event/src/long-press-event.js'],
    output: {
        // 指定要生成的js文件名
        filename: 'apqx.js',
    },
    // resolve: {
    //     extensions: [".tsx", ".ts", ".js", ".json"],
    //     fallback: { "https": false }
    // },
    module: {
        rules: [
            // 支持scss
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            // 输出文件
                            name: 'apqx.css',
                        },
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer()
                                ]
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            // Prefer Dart Sass
                            implementation: require('sass'),
                            // See https://github.com/webpack-contrib/sass-loader/issues/804
                            webpackImporter: false,
                            sassOptions: {
                                // 读取./node_modules目录中的组件作为sass的依赖
                                includePaths: ['./node_modules']
                            }
                        },
                    }

                ]
            },
            // 支持css
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            // 支持ES2015 js/jsx
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
        ],

    },
};