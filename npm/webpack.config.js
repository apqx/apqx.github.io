const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'development',
    // 打包入口
    entry: ['./src/scss/app.scss', './src/script/app.ts',
        './node_modules/long-press-event/src/long-press-event.js'],
    output: {
        // 指定要生成的js文件名
        filename: 'apqx.js',
    },
    resolve: {
        // 指定webpack要处理的文件类型，如果这里不指定.ts等，在打包时会找不到除入口文件之外的该类型文件
        extensions: [".tsx", ".ts", ".js", ".json"],
        fallback: {"https": false}
    },
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
            // 支持ES2015 js/jsx/ts/tsx
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
        ],

    },
};