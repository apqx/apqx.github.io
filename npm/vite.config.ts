import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'node:fs'

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf-8')
) as { version?: string }

// 可选：清理版本号，避免特殊字符影响目录名
const version = (pkg.version ?? '0.0.0').replace(/[^\w.-]/g, '_')

// https://vite.dev/config/
export default defineConfig({
  // 设置基础路径，即拆包后对其它资源的引用路径
  // 设置为相对于当前路径可以保证拆出的包托管到其它位置也能找到所需资源
  base: './',
  build: {
    // 输出的目标版本，默认是兼容当前大部分浏览器的 es2015
    // target: 'esnext', 
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // 抑制第三方依赖 lottie-web 内部使用 direct eval 的告警
        if (warning.code === 'EVAL' && warning.id?.includes('lottie-web')) return
        defaultHandler(warning)
      },
      input: {
        scaffold: path.resolve(import.meta.dirname, 'src/page/scaffold.ts'),
        font: path.resolve(import.meta.dirname, 'src/component/font/font.scss'),
      },
      output: {
        entryFileNames: `blog-[name]-${version}.js`,
        chunkFileNames: `chunks/blog-[name]-${version}.js`,
        assetFileNames: `assets/blog-[name]-${version}[extname]`,
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        additionalData: '' 
      }
    }
  },
  plugins: [react()],
})
