const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'development',
    // 把app.scss转换为bundle.css
    // 给apqx.me使用的scss和js定义
    entry: ['./app.scss', './app.js', './js/tag.js', './js/nav.js'],
    // 给测试使用的scss和js定义
    // entry: ['./demo.scss', './demo.js'],
    output: {
        // 指定要生存的js文件名
        filename: 'apqx.js',
    },
    module: {
        rules: [
            // 将scss转换为css
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
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
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
            // 将ES2015 js转化为js
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
            },
            // 支持读取css
            {
                test: /\.css$/i,
                use: ["css-loader"],
            },
        ]
    },
};