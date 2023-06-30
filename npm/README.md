以`npm`和`webpack`管理工程，为博客生成`css`和`js`文件

# 使用

```sh
# 所有依赖已在package.js中定义，安装依赖
npm install

# 编译，输出所需的apqx.css和apqx.js文件到dist目录下，外部jekyll生成的网页会在测试模式中会读取这两个文件
# 测试完成后，这两个文件应被托管在cdn或其它位置以优化访问速度
npm run build
```