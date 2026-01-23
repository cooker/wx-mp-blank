<template>
  <div class="app-container">
    <div class="editor-container">
      <div class="editor-header">
        <h1>微信公众号文章编辑器</h1>
        <div class="word-count">
          <span :class="{ 'warning': wordCount < 500 }">
            字数：{{ wordCount }} / 500
          </span>
          <button 
            v-if="wordCount < 500" 
            @click="fillRandomText" 
            class="fill-btn"
          >
            自动填充至500字
          </button>
        </div>
      </div>

      <div class="editor-wrapper">
        <div class="editor-toolbar">
          <button 
            @click="toggleCollapse" 
            class="collapse-btn"
            :class="{ 'active': isCollapsed }"
          >
            {{ isCollapsed ? '展开' : '隐藏到最小' }}
          </button>
          <button @click="clearContent" class="clear-btn">清空</button>
        </div>

        <div 
          class="editor-content" 
          :class="{ 'collapsed': isCollapsed }"
        >
          <textarea
            v-model="content"
            @input="handleInput"
            class="editor-textarea"
            placeholder="请输入文章内容..."
            :style="{ minHeight: isCollapsed ? '60px' : '400px' }"
          ></textarea>
        </div>

        <div v-if="isCollapsed" class="collapsed-preview">
          <div class="preview-text">{{ collapsedPreview }}</div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="tips">
          <p>💡 提示：当字数不足500字时，点击"自动填充至500字"按钮会自动填充随机文字</p>
          <p>💡 点击"隐藏到最小"可以将编辑器折叠到最小显示</p>
        </div>
      </div>
    </div>

    <!-- 右侧预览区域 -->
    <div class="preview-container">
      <div class="preview-header">
        <h2>文章预览</h2>
        <button @click="copyToClipboard" class="copy-btn" :disabled="!content">
          {{ copySuccess ? '已复制' : '复制内容' }}
        </button>
      </div>
      <div class="wechat-preview">
        <div class="wechat-article">
          <div class="article-title">
            <input 
              v-model="articleTitle" 
              class="title-input"
              placeholder="请输入文章标题"
            />
          </div>
          <div class="article-meta">
            <span class="author-name">
              <input 
                v-model="authorName" 
                class="meta-input"
                placeholder="作者"
              />
            </span>
            <span class="publish-time">{{ currentTime }}</span>
          </div>
          <div class="article-content">
            <section 
              v-if="content" 
              class="content-text"
              v-html="formattedContent"
            ></section>
            <section v-else class="empty-content">
              <p>请在左侧编辑器中输入文章内容</p>
            </section>
          </div>
          <div class="article-divider"></div>
          <div class="article-footer">
            <div class="read-stats">
              <span>阅读 {{ readCount }}</span>
              <span class="divider">|</span>
              <span>点赞 {{ likeCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const content = ref('')
const isCollapsed = ref(false)
const articleTitle = ref('文章标题')
const authorName = ref('作者名称')
const readCount = ref(Math.floor(Math.random() * 10000) + 100)
const likeCount = ref(Math.floor(Math.random() * 500) + 10)
const copySuccess = ref(false)

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// 计算字数
const wordCount = computed(() => {
  return content.value.length
})

// 格式化内容，将换行转换为段落
const formattedContent = computed(() => {
  if (!content.value) return ''
  return content.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line}</p>`)
    .join('')
})

// 折叠预览文本
const collapsedPreview = computed(() => {
  if (!content.value) return '暂无内容'
  const preview = content.value.substring(0, 50)
  return preview + (content.value.length > 50 ? '...' : '')
})

// 处理输入
const handleInput = () => {
  // 可以在这里添加其他输入处理逻辑
}

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 清空内容
const clearContent = () => {
  if (confirm('确定要清空所有内容吗？')) {
    content.value = ''
  }
}

// 生成随机字符串
const generateRandomText = (length) => {
  const chars = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789，。！？；：、""''（）【】《》`
  const chineseChars = `的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞`
  
  let result = ''
  for (let i = 0; i < length; i++) {
    // 随机选择使用中文或英文
    if (Math.random() > 0.3) {
      // 70%概率使用中文
      result += chineseChars[Math.floor(Math.random() * chineseChars.length)]
    } else {
      // 30%概率使用英文和标点
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    // 每10个字符添加一个空格或标点
    if (i > 0 && i % 10 === 0 && Math.random() > 0.5) {
      result += '，'
    }
  }
  return result
}

// 自动填充随机文字
const fillRandomText = () => {
  const currentLength = content.value.length
  if (currentLength < 500) {
    const needFill = 500 - currentLength
    const randomText = generateRandomText(needFill)
    content.value += randomText
  }
}

// 监听字数变化，自动填充
watch(wordCount, (newCount) => {
  // 如果用户手动输入导致字数超过500，不做处理
  // 只在字数不足时提示
})

// 获取正文内容（纯文本）
const getFullArticleText = () => {
  // 只返回正文内容
  return content.value || ''
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const text = getFullArticleText()
    
    if (!text.trim()) {
      alert('没有内容可复制')
      return
    }
    
    // 使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } else {
      // 降级方案：使用传统的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    }
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请重试')
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  padding-right: 440px;
  max-width: 1600px;
  margin: 0 auto;
  align-items: flex-start;
}

.editor-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 0;
}

.editor-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.editor-header h1 {
  font-size: 24px;
  font-weight: 600;
}

.word-count {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count span {
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.word-count span.warning {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.fill-btn {
  padding: 8px 20px;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.fill-btn:hover {
  background: #ffb300;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.editor-wrapper {
  position: relative;
}

.editor-toolbar {
  padding: 12px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
}

.collapse-btn,
.clear-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover,
.clear-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.collapse-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.editor-content {
  padding: 24px;
  transition: all 0.3s ease;
}

.editor-content.collapsed {
  padding: 12px 24px;
  max-height: 100px;
  overflow: hidden;
}

.editor-textarea {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  outline: none;
}

.editor-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.collapsed-preview {
  padding: 12px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e8e8e8;
}

.preview-text {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px dashed #ddd;
}

.editor-footer {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e8e8e8;
}

.tips {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.tips p {
  margin: 4px 0;
}

/* 右侧预览区域 */
.preview-container {
  width: 400px;
  height: 100vh;
  max-height: 100vh;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: fixed;
  right: 20px;
  top: 0;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.copy-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.copy-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copy-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.wechat-preview {
  padding: 15px;
  background: #ededed;
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.wechat-article {
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.article-title {
  padding: 20px 15px 12px;
  border-bottom: none;
  flex-shrink: 0;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  padding: 0;
  background: transparent;
}

.title-input::placeholder {
  color: #999;
  font-weight: normal;
  font-size: 20px;
}

.article-meta {
  padding: 0 15px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
  border-bottom: none;
  flex-shrink: 0;
}

.author-name {
  display: flex;
  align-items: center;
}

.meta-input {
  border: none;
  outline: none;
  font-size: 12px;
  color: #8c8c8c;
  background: transparent;
  padding: 0;
  min-width: 60px;
}

.meta-input::placeholder {
  color: #ccc;
  font-size: 12px;
}

.publish-time {
  color: #8c8c8c;
  font-size: 12px;
}

.article-content {
  padding: 0 15px 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.content-text {
  font-size: 1px;
  line-height: 1.75;
  color: #3e3e3e;
  word-wrap: break-word;
  word-break: break-all;
  letter-spacing: 0.5px;
}

.content-text p {
  margin: 0 0 1.2em 0;
  text-indent: 0;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #ccc;
  font-size: 14px;
}

.empty-content p {
  margin: 0;
}

.article-divider {
  height: 1px;
  background: #e7e7e7;
  margin: 0 15px;
  flex-shrink: 0;
}

.article-footer {
  padding: 12px 15px;
  background: #fff;
  flex-shrink: 0;
}

.read-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.divider {
  color: #d9d9d9;
}

/* 滚动条样式 */
.wechat-preview::-webkit-scrollbar,
.article-content::-webkit-scrollbar {
  width: 6px;
}

.wechat-preview::-webkit-scrollbar-track,
.article-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.wechat-preview::-webkit-scrollbar-thumb,
.article-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.wechat-preview::-webkit-scrollbar-thumb:hover,
.article-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-container {
    flex-direction: column;
    padding-right: 20px;
  }
  
  .preview-container {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    position: fixed;
    right: 0;
    top: 0;
  }
  
  .wechat-article {
    max-width: 100%;
  }
}
</style>
