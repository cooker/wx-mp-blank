import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 获取仓库名称，用于 GitHub Pages 部署
// 如果是在 GitHub Actions 中，使用环境变量；否则使用默认值
const getBasePath = () => {
  // GitHub Actions 环境变量
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    return `/${repoName}/`
  }
  // 本地开发或自定义部署
  return '/'
}

export default defineConfig({
  plugins: [vue()],
  base: getBasePath(),
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
