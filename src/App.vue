<template>
  <div class="app-wrapper">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <h1 class="app-title">微信公众号文章编辑器</h1>
      <div class="header-actions">
        <div class="word-count-info" :class="{ 'warning': wordCount < targetWordCount }">
          <span class="count-text">字数：{{ wordCount }} / {{ targetWordCount }}</span>
          <div class="target-word-input-wrapper">
            <label class="target-label">目标：</label>
            <input 
              v-model.number="targetWordCount" 
              type="number" 
              min="1" 
              max="10000"
              class="target-word-input"
            />
            <span class="target-unit">字</span>
          </div>
          <button 
            v-if="wordCount < targetWordCount" 
            @click="fillRandomText" 
            class="action-btn fill-btn"
          >
            自动填充至{{ targetWordCount }}字
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 左侧编辑区 -->
      <section class="editor-section">
        <div class="editor-panel">
          <!-- 编辑器工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <button 
                @click="toggleCollapse" 
                class="toolbar-btn"
                :class="{ 'active': isCollapsed }"
              >
                {{ isCollapsed ? '展开' : '隐藏到最小' }}
              </button>
              <button @click="clearContent" class="toolbar-btn">清空</button>
              <div class="nonsense-generator">
                <input 
                  v-model="customTags" 
                  type="text" 
                  class="tags-input"
                  placeholder="输入标签（用逗号分隔，如：科技,创新,未来）"
                  @keyup.enter="generateNonsenseText"
                />
                <button 
                  @click="generateNonsenseText" 
                  class="toolbar-btn nonsense-btn"
                >
                  生成狗屁不通
                </button>
              </div>
            </div>
          </div>

          <!-- 编辑器内容区 -->
          <div class="editor-body" :class="{ 'collapsed': isCollapsed }">
            <textarea
              v-model="content"
              @input="handleInput"
              class="editor-textarea"
              placeholder="请输入文章内容..."
              :style="{ minHeight: isCollapsed ? '60px' : '100%' }"
            ></textarea>
          </div>

          <!-- 折叠预览 -->
          <div v-if="isCollapsed" class="collapsed-preview">
            <div class="preview-text">{{ collapsedPreview }}</div>
          </div>

          <!-- 底部提示 -->
          <div class="editor-footer">
            <div class="tips">
              <p>💡 提示：当字数不足目标字数时，点击"自动填充"按钮会自动填充随机文字</p>
              <p>💡 输入自定义标签（用逗号分隔），点击"生成狗屁不通"可以生成基于标签的无意义内容</p>
              <p>💡 点击"隐藏到最小"可以将编辑器折叠到最小显示</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧预览区 -->
      <aside class="preview-section">
        <div class="preview-panel">
          <!-- 预览头部 -->
          <div class="preview-header">
            <h2 class="preview-title">文章预览</h2>
            <button 
              @click="copyToClipboard" 
              class="action-btn copy-btn" 
              :disabled="!content"
            >
              {{ copySuccess ? '已复制' : '复制内容' }}
            </button>
          </div>

          <!-- 预览内容 -->
          <div class="preview-body">
            <div class="wechat-article">
              <!-- 文章标题 -->
              <div class="article-title">
                <input 
                  v-model="articleTitle" 
                  class="title-input"
                  placeholder="请输入文章标题"
                />
              </div>

              <!-- 文章元信息 -->
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

              <!-- 文章正文 -->
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

              <!-- 分割线 -->
              <div class="article-divider"></div>

              <!-- 文章底部 -->
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
      </aside>
    </main>
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
const targetWordCount = ref(600) // 目标字数，默认600字
const customTags = ref('') // 自定义标签

// 监听目标字数变化，确保在合理范围内
watch(targetWordCount, (newValue) => {
  if (newValue < 1) {
    targetWordCount.value = 1
  } else if (newValue > 10000) {
    targetWordCount.value = 10000
  }
})

// 违禁词列表（示例，可根据实际需求扩展）
const forbiddenWords = [
  '政治敏感词1', '政治敏感词2', // 示例，请替换为实际违禁词
  '色情', '暴力', '赌博', '毒品',
  '诈骗', '传销', '非法', '违法'
]

// 检测文本中是否包含违禁词
const containsForbiddenWord = (text) => {
  if (!text) return false
  const lowerText = text.toLowerCase()
  return forbiddenWords.some(word => {
    // 检测中文违禁词
    if (text.includes(word)) return true
    // 检测英文违禁词（不区分大小写）
    if (lowerText.includes(word.toLowerCase())) return true
    return false
  })
}

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

// 格式化内容，将换行转换为 section
const formattedContent = computed(() => {
  if (!content.value) return ''
  return content.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<section textstyle style="font-size: 0px">${line}</section>`)
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

// 生成随机字符串（确保不包含违禁词，每300字自动换行）
const generateRandomText = (length) => {
  const chars = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789，。！？；：、""''（）【】《》`
  // 使用安全的常用汉字，避免包含违禁词
  const chineseChars = `美女颜值好看二次元女神新人摄影展览`
  
  let result = ''
  let attempts = 0
  const maxAttempts = length * 10 // 最大尝试次数，避免无限循环
  const lineBreakInterval = 300 // 每300字换行
  let contentCharCount = 0 // 实际内容字符数（不包括换行符）
  
  while (contentCharCount < length && attempts < maxAttempts) {
    let char = ''
    
    // 随机选择使用中文或英文
    if (Math.random() > 0.3) {
      // 70%概率使用中文
      char = chineseChars[Math.floor(Math.random() * chineseChars.length)]
    } else {
      // 30%概率使用英文和标点
      char = chars[Math.floor(Math.random() * chars.length)]
    }
    
    // 检查添加这个字符后是否会形成违禁词
    // 只检查当前行的内容（不包括换行符）
    const currentLine = result.split('\n').pop() || ''
    const testText = currentLine + char
    
    // 检查当前字符和最近几个字符的组合是否包含违禁词
    // 检查最近20个字符的组合（覆盖更长的违禁词）
    const checkLength = Math.min(20, testText.length)
    const recentText = testText.slice(-checkLength)
    
    if (!containsForbiddenWord(recentText)) {
      result += char
      contentCharCount++
      
      // 每10个字符添加一个空格或标点
      if (contentCharCount > 0 && contentCharCount % 10 === 0 && Math.random() > 0.5) {
        const punctuation = '，'
        const testWithPunc = currentLine + char + punctuation
        const checkPuncLength = Math.min(20, testWithPunc.length)
        const recentWithPunc = testWithPunc.slice(-checkPuncLength)
        if (!containsForbiddenWord(recentWithPunc)) {
          result += punctuation
          contentCharCount++
        }
      }
      
      // 检查是否需要换行（每300字换行一次）
      if (contentCharCount > 0 && contentCharCount % lineBreakInterval === 0 && contentCharCount < length) {
        result += '\n'
      }
    }
    
    attempts++
  }
  
  // 最终检查整个结果是否包含违禁词
  // 如果包含违禁词，返回空字符串，由调用者处理
  if (containsForbiddenWord(result)) {
    return ''
  }
  
  return result
}

// 安全生成随机文字（确保不包含违禁词，带重试机制）
const generateRandomTextSafe = (length, maxRetries = 10) => {
  for (let i = 0; i < maxRetries; i++) {
    const text = generateRandomText(length)
    if (text && !containsForbiddenWord(text)) {
      return text
    }
  }
  // 如果多次尝试都失败，返回一个安全的默认文本
  const safeText = '这是一段安全的示例文字。'
  const remainingLength = Math.max(0, length - safeText.length)
  return safeText + '的'.repeat(remainingLength)
}

// 自动填充随机文字（确保不包含违禁词，必须填充到目标字数）
const fillRandomText = () => {
  const currentLength = content.value.length
  const target = targetWordCount.value || 600 // 确保目标字数有效，默认600
  
  if (currentLength < target) {
    const needFill = target - currentLength
    
    // 尝试生成随机文字
    let filledText = generateRandomTextSafe(needFill)
    
    // 如果生成失败或字数不足，使用安全字符补充
    if (!filledText) {
      filledText = ''
    }
    
    // 计算实际生成的字数（不包括换行符）
    const actualLength = filledText.replace(/\n/g, '').length
    
    // 如果字数不足，用安全字符补充到目标字数
    if (actualLength < needFill) {
      const remaining = needFill - actualLength
      filledText += '的'.repeat(remaining)
    }
    
    // 检查最终内容是否包含违禁词
    const finalContent = content.value + filledText
    if (containsForbiddenWord(finalContent)) {
      // 如果包含违禁词，使用完全安全的字符填充
      filledText = '的'.repeat(needFill)
    }
    
    // 添加填充的文字
    content.value += filledText
    
    // 最终验证：确保字数达到目标（不包括换行符）
    const finalLength = content.value.replace(/\n/g, '').length
    if (finalLength < target) {
      const additional = target - finalLength
      content.value += '的'.repeat(additional)
    }
  }
}

// 生成狗屁不通的内容（支持多个自定义标签）
const generateNonsenseText = () => {
  // 解析自定义标签
  const tags = customTags.value
    .split(/[,，、]/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  // 如果没有标签，使用默认标签
  const defaultTags = ['发展', '创新', '未来', '科技', '进步', '变革', '机遇', '挑战']
  const finalTags = tags.length > 0 ? tags : defaultTags
  
  // 狗屁不通的常用词汇和句式
  const nonsenseWords = [
    '众所周知', '毋庸置疑', '显而易见', '不言而喻', '显而易见',
    '从某种意义上说', '在某种程度上', '从另一个角度来看',
    '值得我们深思的是', '需要指出的是', '必须承认',
    '毫无疑问', '可以预见', '不难发现', '显而易见',
    '从长远来看', '从短期来看', '从宏观角度', '从微观角度',
    '在新时代背景下', '在当前形势下', '在全球化进程中',
    '随着时代的发展', '随着科技的进步', '随着社会的变迁',
    '这是一个值得探讨的问题', '这是一个复杂的问题',
    '我们需要深入思考', '我们需要全面分析', '我们需要客观看待'
  ]
  
  const connectors = [
    '然而', '但是', '不过', '可是', '虽然', '尽管',
    '因此', '所以', '于是', '从而', '进而', '从而',
    '同时', '另外', '此外', '而且', '并且', '以及',
    '首先', '其次', '再次', '最后', '总之', '综上所述'
  ]
  
  const verbs = [
    '推动', '促进', '提升', '增强', '改善', '优化',
    '实现', '达成', '完成', '取得', '获得', '拥有',
    '影响', '改变', '转变', '发展', '进步', '提升',
    '探索', '研究', '分析', '思考', '探讨', '讨论'
  ]
  
  const adjectives = [
    '重要的', '关键的', '核心的', '主要的', '基本的',
    '深远的', '广泛的', '全面的', '深入的', '系统的',
    '积极的', '正面的', '有效的', '显著的', '明显的',
    '复杂的', '多元的', '丰富的', '多样的', '全面的'
  ]
  
  // 生成句子模板
  const generateSentence = (tag) => {
    const templates = [
      `${tag}是${getRandom(adjectives)}${getRandom(verbs)}的重要途径。`,
      `在${tag}领域，我们需要${getRandom(verbs)}${getRandom(adjectives)}的发展。`,
      `${getRandom(nonsenseWords)}，${tag}${getRandom(verbs)}了${getRandom(adjectives)}变化。`,
      `从${tag}的角度来看，${getRandom(nonsenseWords)}，这${getRandom(verbs)}了新的${getRandom(adjectives)}机遇。`,
      `${tag}不仅${getRandom(verbs)}了${getRandom(adjectives)}影响，还${getRandom(verbs)}了${getRandom(adjectives)}变革。`,
      `${getRandom(connectors)}，${tag}在${getRandom(adjectives)}方面${getRandom(verbs)}了${getRandom(adjectives)}作用。`,
      `关于${tag}，${getRandom(nonsenseWords)}，我们需要${getRandom(verbs)}${getRandom(adjectives)}的思考。`,
      `${tag}${getRandom(verbs)}了${getRandom(adjectives)}趋势，${getRandom(connectors)}也${getRandom(verbs)}了${getRandom(adjectives)}挑战。`
    ]
    return getRandom(templates)
  }
  
  // 生成段落
  const generateParagraph = () => {
    const sentences = []
    const tagCount = Math.min(finalTags.length, 3) // 每个段落使用最多3个标签
    const selectedTags = shuffleArray([...finalTags]).slice(0, tagCount)
    
    // 生成3-5个句子
    const sentenceCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < sentenceCount; i++) {
      const tag = selectedTags[i % selectedTags.length]
      sentences.push(generateSentence(tag))
    }
    
    return sentences.join('')
  }
  
  // 生成指定字数的内容
  const targetLength = targetWordCount.value || 600
  let result = ''
  let currentLength = 0
  
  while (currentLength < targetLength) {
    const paragraph = generateParagraph()
    const paragraphLength = paragraph.length
    
    if (currentLength + paragraphLength <= targetLength) {
      result += paragraph
      currentLength += paragraphLength
      
      // 每300字换行
      if (currentLength > 0 && currentLength % 300 === 0 && currentLength < targetLength) {
        result += '\n'
      }
    } else {
      // 如果段落太长，截取需要的部分
      const remaining = targetLength - currentLength
      result += paragraph.substring(0, remaining)
      currentLength = targetLength
    }
  }
  
  // 确保达到目标字数
  if (currentLength < targetLength) {
    const remaining = targetLength - currentLength
    result += '的'.repeat(remaining)
  }
  
  // 替换内容
  content.value = result
}

// 辅助函数：随机获取数组元素
const getRandom = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

// 辅助函数：打乱数组
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 监听字数变化，自动填充
watch(wordCount, (newCount) => {
  // 如果用户手动输入导致字数超过目标字数，不做处理
  // 只在字数不足时提示
})

// 获取格式化后的 HTML 内容（用于复制，使用 section 标签）
const getFormattedHTML = () => {
  if (!content.value) return ''
  
  // 将换行转换为 <section> 标签包裹的内容
  return content.value
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const lineLength = line.length
      // 如果内容没有超过300字，使用 <section><span> 标签包裹
      if (lineLength <= 300) {
        return `<section><span textstyle style="font-size: 0px">${line}</span></section>`
      } else {
        // 如果超过300字，直接使用 <section> 标签
        return `<section textstyle style="font-size: 0px">${line}</section>`
      }
    })
    .join('')
}

// 获取正文内容（纯文本，用于降级方案）
const getFullArticleText = () => {
  return content.value || ''
}

// 复制到剪贴板（带 HTML 格式）
const copyToClipboard = async () => {
  try {
    const htmlContent = getFormattedHTML()
    const textContent = getFullArticleText()
    
    if (!textContent.trim()) {
      alert('没有内容可复制')
      return
    }
    
    // 使用 Clipboard API 写入 HTML 格式
    if (navigator.clipboard && navigator.clipboard.write) {
      try {
        // 创建 ClipboardItem，同时包含 HTML 和纯文本格式
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
        const textBlob = new Blob([textContent], { type: 'text/plain' })
        
        const clipboardItem = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
        
        await navigator.clipboard.write([clipboardItem])
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
        return
      } catch (clipboardError) {
        // 如果 ClipboardItem 不支持，降级到传统方法
        console.warn('ClipboardItem 不支持，使用降级方案:', clipboardError)
      }
    }
    
    // 降级方案：创建一个隐藏的 div，包含格式化后的 HTML，然后复制
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'fixed'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '-9999px'
    tempDiv.style.width = '1px'
    tempDiv.style.height = '1px'
    tempDiv.style.overflow = 'hidden'
    // 设置 contenteditable 以便复制 HTML 格式
    tempDiv.setAttribute('contenteditable', 'true')
    tempDiv.innerHTML = htmlContent
    document.body.appendChild(tempDiv)
    
    // 选中内容
    const range = document.createRange()
    range.selectNodeContents(tempDiv)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 复制
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
      } else {
        throw new Error('execCommand 复制失败')
      }
    } catch (execError) {
      // 最后的降级方案：复制纯文本
      console.warn('execCommand 失败，使用纯文本复制:', execError)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textContent)
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = textContent
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
    } finally {
      // 清理
      selection.removeAllRanges()
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请重试')
  }
}
</script>

<style scoped>
/* 整体布局 */
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
}

/* 顶部标题栏 */
.app-header {
  flex-shrink: 0;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.word-count-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-text {
  font-size: 14px;
  font-weight: 500;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.word-count-info.warning .count-text {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.target-word-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 4px;
}

.target-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.target-word-input {
  width: 60px;
  padding: 2px 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 13px;
  text-align: center;
  outline: none;
}

.target-word-input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  background: white;
}

.target-unit {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.action-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.fill-btn {
  background: #ffc107;
  color: #333;
}

.fill-btn:hover {
  background: #ffb300;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* 主内容区 */
.app-main {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  padding-right: 460px;
  overflow: hidden;
}

/* 左侧编辑区 */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 编辑器工具栏 */
.editor-toolbar {
  flex-shrink: 0;
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.nonsense-generator {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: 12px;
}

.tags-input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 13px;
  min-width: 200px;
  outline: none;
  transition: all 0.3s;
}

.tags-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.nonsense-btn {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0;
}

.nonsense-btn:hover {
  background: #7b1fa2;
  border-color: #7b1fa2;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(156, 39, 176, 0.3);
}

.toolbar-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.toolbar-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 编辑器内容区 */
.editor-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: all 0.3s ease;
}

.editor-body.collapsed {
  padding: 12px 20px;
  max-height: 100px;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  font-family: inherit;
  resize: none;
  transition: all 0.3s ease;
  outline: none;
}

.editor-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 折叠预览 */
.collapsed-preview {
  flex-shrink: 0;
  padding: 12px 20px;
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

/* 编辑器底部 */
.editor-footer {
  flex-shrink: 0;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e8e8e8;
}

.tips {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}

.tips p {
  margin: 4px 0;
}

/* 右侧预览区 */
.preview-section {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: fixed;
  right: 40px;
  top: 80px;
  bottom: 20px;
  width: 400px;
}

.preview-header {
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
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

.preview-body {
  flex: 1;
  padding: 15px;
  background: #ededed;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;
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

.content-text span {
  display: block;
  margin: 0 0 1.2em 0;
  text-indent: 0;
}

.content-text span:last-child {
  margin-bottom: 0;
}

.content-text section {
  display: block;
  margin: 0 0 1.2em 0;
  text-indent: 0;
}

.content-text section:last-child {
  margin-bottom: 0;
}

/* section 内部有 span 时的样式 */
.content-text section span {
  display: block;
  margin: 0;
  text-indent: 0;
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
.preview-body::-webkit-scrollbar,
.article-content::-webkit-scrollbar {
  width: 6px;
}

.preview-body::-webkit-scrollbar-track,
.article-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.preview-body::-webkit-scrollbar-thumb,
.article-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.preview-body::-webkit-scrollbar-thumb:hover,
.article-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-main {
    flex-direction: column;
    padding-right: 20px;
  }
  
  .preview-section {
    width: 100%;
  }
  
  .preview-panel {
    position: relative;
    right: auto;
    top: auto;
    bottom: auto;
    width: 100%;
    height: 600px;
  }
  
  .wechat-article {
    max-width: 100%;
  }
}
</style>
