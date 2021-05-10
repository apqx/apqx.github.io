基于`Node.js`，以`npm`和`webpack`管理工程，为博客生成`css`和`js`文件

# 使用

```sh
# 所有依赖已在package.js中定义，安装依赖
npm install

# 编译，输出所需的apqx.css和apqx.js文件到dist目录下，外部jekyll生成的网页会在测试模式中会读取这两个文件
# 测试完成后，这两个文件会被单独托管在cdn或其它位置
npm run build

# 也可以使用npm的localhost:8080网页服务，将读取本目录下的index.html作为入口，在这个测试服务中，apqx.js和apqx.css是在本目录中的
npm start
```