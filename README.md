# 微信公众号文章编辑器

一个基于 Vue 3 的微信公众号文章编辑器，支持文字折叠和自动填充功能。

## 功能特性

- ✨ 实时字数统计
- 📝 文字编辑功能
- 🔽 文字隐藏到最小显示（折叠/展开）
- 🔄 可自定义目标字数自动填充随机文字（默认500字）
- 🎨 现代化的UI设计
- 📋 复制内容支持 HTML 格式，粘贴到公众号编辑器保持格式
- 🚫 自动过滤违禁词

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 构建项目

```bash
npm run build
```

## 部署到 GitHub Pages

项目已配置 GitHub Actions，自动构建并部署到 GitHub Pages。

### 自动部署

1. 确保仓库已启用 GitHub Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. 推送代码到 `main` 或 `master` 分支：
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

3. GitHub Actions 会自动构建并部署
   - 查看 Actions 标签页了解部署状态
   - 部署完成后，访问 `https://你的用户名.github.io/仓库名/`

### 手动触发部署

在 GitHub 仓库的 Actions 标签页，选择 "Deploy to GitHub Pages" 工作流，点击 "Run workflow" 按钮。

## 使用说明

1. **编辑文章**：在文本框中输入或粘贴文章内容
2. **设置目标字数**：在顶部标题栏可以自定义目标字数（默认500字）
3. **查看字数**：顶部实时显示当前字数，不足目标字数时会高亮提示
4. **自动填充**：当字数不足目标字数时，点击"自动填充"按钮会自动填充随机文字
5. **复制内容**：点击"复制内容"按钮，会将格式化后的内容复制到剪贴板，粘贴到公众号编辑器时保持格式
6. **折叠编辑器**：点击"隐藏到最小"按钮可以将编辑器折叠到最小显示，再次点击可展开

## 技术栈

- Vue 3
- Vite
- CSS3
