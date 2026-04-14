<template>
  <div class="result-view">
    <!-- 动态背景 -->
    <div class="result-background">
      <div class="celebration-particles" v-if="!loading">
        <span v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)">✦</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-orbit">
        <div class="orbit-ring"></div>
        <div class="orbit-planet">🌟</div>
      </div>
      <p class="loading-text">正在生成您的专属报告...</p>
    </div>

    <div v-else class="result-container">
      <!-- 结果头部 -->
      <header class="result-header">
        <div class="header-badge">
          <div class="badge-glow"></div>
          <span class="badge-icon">🌟</span>
        </div>
        <h1 class="result-title">
          <span class="gradient-text">测试完成</span>
        </h1>
        <p class="result-subtitle">您的星座性格心灵分析报告已生成</p>
        <div class="result-date">{{ currentDate }}</div>
      </header>

      <!-- MBTI类型展示 -->
      <div v-if="mbtiType" class="mbti-showcase">
        <div class="mbti-card">
          <div class="mbti-glow"></div>
          <div class="mbti-content">
            <span class="mbti-label">您的 MBTI 类型</span>
            <h2 class="mbti-type">{{ mbtiType }}</h2>
            <p class="mbti-name">{{ getMBTIName(mbtiType) }}</p>
            <div class="mbti-traits">
              <span v-for="trait in getMBTITraits(mbtiType)" :key="trait" class="trait-tag">
                {{ trait }}
              </span>
            </div>
          </div>
          <div class="mbti-decoration">
            <span class="deco-1">◆</span>
            <span class="deco-2">◆</span>
            <span class="deco-3">◆</span>
          </div>
        </div>
      </div>

      <!-- 得分展示 -->
      <div v-else class="score-showcase">
        <div class="score-card">
          <div class="score-circle">
            <svg class="score-ring" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="50%" style="stop-color:#764ba2"/>
                  <stop offset="100%" style="stop-color:#f5af19"/>
                </linearGradient>
              </defs>
              <circle class="score-ring-bg" cx="60" cy="60" r="54"/>
              <circle 
                class="score-ring-progress" 
                cx="60" 
                cy="60" 
                r="54"
                :style="{ strokeDashoffset: 339.292 - (339.292 * score / 100) }"
              />
            </svg>
            <div class="score-value">
              <span class="score-number">{{ score }}</span>
              <span class="score-label">总分</span>
            </div>
          </div>
          <div class="score-rating">
            <div class="stars">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.ceil(score / 20) }">★</span>
            </div>
            <p class="rating-text">{{ getRatingText(score) }}</p>
          </div>
        </div>
      </div>

      <!-- 报告内容 -->
      <div class="report-section">
        <div class="report-card">
          <div class="report-header">
            <div class="header-icon">📜</div>
            <div class="header-text">
              <h3>性格分析报告</h3>
              <span class="header-subtitle">基于您的回答生成</span>
            </div>
          </div>
          <div class="report-body">
            <p class="report-text">{{ report }}</p>
          </div>
          <div class="report-tags">
            <span class="tag">#性格分析</span>
            <span class="tag">#星座特质</span>
            <span class="tag">#心理测试</span>
          </div>
        </div>
      </div>

      <!-- 详细分析（已解锁时显示） -->
      <div v-if="isPaid" class="detailed-analysis">
        <div class="analysis-card">
          <h3 class="analysis-title">
            <span class="title-icon">🔍</span>
            详细维度分析
          </h3>
          <div class="dimensions">
            <div class="dimension" v-for="(dim, idx) in dimensions" :key="idx">
              <div class="dim-header">
                <span class="dim-name">{{ dim.name }}</span>
                <span class="dim-score">{{ dim.score }}%</span>
              </div>
              <div class="dim-bar">
                <div class="dim-fill" :style="{ width: `${dim.score}%` }"></div>
              </div>
              <p class="dim-desc">{{ dim.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分享区域 -->
      <div class="share-section">
        <h3 class="share-title">分享你的结果</h3>
        <p class="share-desc">让朋友们也了解自己的性格特质</p>
        <div class="share-buttons">
          <button class="share-btn wechat" @click="shareToWechat">
            <span class="btn-icon">💬</span>
            <span>微信</span>
          </button>
          <button class="share-btn weibo" @click="shareToWeibo">
            <span class="btn-icon">📱</span>
            <span>微博</span>
          </button>
          <button class="share-btn copy" @click="copyLink">
            <span class="btn-icon">📋</span>
            <span>复制链接</span>
          </button>
        </div>
      </div>

      <!-- 付费解锁区域 -->
      <div v-if="!isPaid" class="unlock-section">
        <div class="unlock-card">
          <div class="unlock-header">
            <div class="unlock-icon">🔮</div>
            <h3 class="unlock-title">解锁完整报告</h3>
            <p class="unlock-desc">获取更详细的性格分析、星座匹配建议和发展指导</p>
          </div>
          
          <div class="unlock-features">
            <div class="unlock-feature" v-for="(feature, idx) in unlockFeatures" :key="idx">
              <div class="feature-icon-check">✓</div>
              <span>{{ feature }}</span>
            </div>
          </div>

          <div class="unlock-price">
            <div class="price-tag">
              <span class="price-label">限时优惠</span>
              <div class="price-value">
                <span class="currency">¥</span>
                <span class="amount">{{ (price / 100).toFixed(2) }}</span>
              </div>
            </div>
            <div class="price-original">
              原价 ¥{{ ((price * 2) / 100).toFixed(2) }}
            </div>
          </div>

          <button class="btn btn-gold unlock-btn" @click="payForReport">
            <span class="sparkle">✨</span>
            <span>立即解锁</span>
            <span class="sparkle">✨</span>
          </button>

          <div class="unlock-guarantees">
            <span class="guarantee">🔒 安全支付</span>
            <span class="guarantee">📄 永久查看</span>
            <span class="guarantee">💯 满意保证</span>
          </div>
        </div>
      </div>

      <!-- 已解锁状态 -->
      <div v-else class="unlocked-section">
        <div class="unlocked-card">
          <div class="unlocked-icon">🎉</div>
          <h3>已解锁完整报告</h3>
          <p>您已获得所有分析内容，可随时查看</p>
          <div class="unlocked-badge">VIP</div>
        </div>
      </div>

      <!-- 推荐测试 -->
      <div class="recommend-section">
        <h3 class="recommend-title">您可能还感兴趣</h3>
        <div class="recommend-list">
          <div class="recommend-item" v-for="(item, idx) in recommendations" :key="idx" @click="goToTest(item.id)">
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
            <div class="item-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-outline action-btn" @click="goHome">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          返回首页
        </button>
        <button class="btn btn-primary action-btn" @click="retakeTest">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          重新测试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const responseId = route.params.responseId

const scoreParam = route.query.score
const mbtiTypeParam = route.query.mbtiType
const freeReportParam = route.query.freeReport
const successParam = route.query.success

const loading = ref(true)
const score = ref(scoreParam || 0)
const mbtiType = ref('')
const report = ref('')
const isPaid = ref(false)
const price = ref(500)
const currentDate = ref('')

const mbtiNames = {
  'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
  'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
  'ISTJ': '检查员', 'ISFJ': '保护者', 'ESTJ': '总经理', 'ESFJ': '执政官',
  'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
}

const mbtiTraits = {
  'INTJ': ['战略思维', '独立自主', '追求完美', '理性分析'],
  'INTP': ['逻辑思考', '好奇心强', '客观公正', '理论探索'],
  'ENTJ': ['领导力', '果断决策', '目标导向', '高效执行'],
  'ENTP': ['创新思维', '辩论能力', '适应性强', '机智幽默'],
  'INFJ': ['洞察力', '理想主义', '同理心', '创造力'],
  'INFP': ['理想主义', '忠于自我', '富有创意', '善解人意'],
  'ENFJ': ['魅力领袖', '热心助人', '组织能力强', '情感丰富'],
  'ENFP': ['热情洋溢', '创意无限', '善于沟通', '自由精神'],
  'ISTJ': ['责任心强', '注重细节', '传统保守', '可靠稳重'],
  'ISFJ': ['奉献精神', '耐心细致', '忠诚可靠', '实际务实'],
  'ESTJ': ['管理才能', '实事求是', '组织有序', '遵守规则'],
  'ESFJ': ['热心助人', '社交能力强', '传统价值观', '和谐追求'],
  'ISTP': ['灵活应变', '理性分析', '动手能力', '冷静沉着'],
  'ISFP': ['艺术天赋', '敏感细腻', '和谐追求', '灵活适应'],
  'ESTP': ['精力充沛', '冒险精神', '实用主义', '活在当下'],
  'ESFP': ['表演天赋', '热情开朗', '社交达人', '享受生活']
}

const dimensions = [
  { name: '外向性', score: 75, description: '您倾向于在社交场合中感到舒适和充满活力' },
  { name: '开放性', score: 82, description: '您对新体验持开放态度，富有想象力和好奇心' },
  { name: '尽责性', score: 68, description: '您在组织和自律方面表现良好' },
  { name: '宜人性', score: 79, description: '您善解人意，容易与他人建立良好关系' },
  { name: '情绪稳定性', score: 71, description: '您能够较好地管理情绪，保持冷静' }
]

const unlockFeatures = [
  '详细的性格维度分析',
  '星座配对建议',
  '职业发展指导',
  '人际关系建议',
  '个人成长路径',
  '专属星座运势'
]

const recommendations = [
  { id: 2, icon: '💕', title: '爱情匹配测试', desc: '了解你的爱情观和最佳配对' },
  { id: 3, icon: '💼', title: '职业性格测试', desc: '发现适合你的职业方向' },
  { id: 4, icon: '👥', title: '人际关系测试', desc: '提升你的社交能力' }
]

const getMBTIName = (type) => mbtiNames[type] || '独特人格'
const getMBTITraits = (type) => mbtiTraits[type] || ['独特', '有魅力', '与众不同']

const getRatingText = (score) => {
  if (score >= 90) return '卓越'
  if (score >= 80) return '优秀'
  if (score >= 70) return '良好'
  if (score >= 60) return '及格'
  return '待提升'
}

const getParticleStyle = (n) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3}s`,
  animationDuration: `${3 + Math.random() * 2}s`,
  fontSize: `${10 + Math.random() * 20}px`
})

onMounted(async () => {
  // 设置当前日期
  const now = new Date()
  currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

  if (freeReportParam) {
    score.value = Number(scoreParam) || 0
    mbtiType.value = mbtiTypeParam || ''
    report.value = decodeURIComponent(freeReportParam)
    price.value = 500
    loading.value = false
  }
  
  if (successParam === 'true') {
    await fetchReport()
    router.replace(`/report/${responseId}`)
  }
  
  if (!freeReportParam && !successParam) {
    await fetchReport()
  }
})

const fetchReport = async () => {
  try {
    const res = await request.get(`/reports/${responseId}`)
    score.value = res.score
    report.value = res.report
    isPaid.value = res.isPaid
    mbtiType.value = res.mbtiType 
    price.value = res.price || 500
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const payForReport = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('请先登录后再解锁完整报告')
    return
  }
  try {
    const res = await request.post(`/reports/${responseId}/create-payment`)
    window.location.href = res.paymentUrl
  } catch (err) {
    alert('创建支付失败')
    console.error(err)
  }
}

const shareToWechat = () => {
  alert('请使用微信扫一扫功能分享此页面')
}

const shareToWeibo = () => {
  const text = `我刚刚完成了星座心灵测试，我的MBTI类型是${mbtiType.value}！快来测测你的吧！`
  const url = window.location.href
  window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('链接已复制到剪贴板')
  })
}

const goToTest = (id) => {
  router.push(`/test/${id}`)
}

const goHome = () => {
  router.push('/')
}

const retakeTest = () => {
  router.back()
}
</script>

<style scoped>
.result-view {
  min-height: calc(100vh - 140px);
  padding: 20px 0;
  position: relative;
}

/* 动态背景 */
.result-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  color: var(--star-gold);
  opacity: 0;
  animation: float-up 4s ease-in-out infinite;
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(100vh) rotate(0deg);
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) rotate(360deg);
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 24px;
}

.loading-orbit {
  position: relative;
  width: 120px;
  height: 120px;
}

.orbit-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 215, 0, 0.2);
  border-top-color: var(--star-gold);
  border-radius: 50%;
  animation: rotate 1.5s linear infinite;
}

.orbit-planet {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

.result-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 头部样式 */
.result-header {
  text-align: center;
  padding: 40px 0;
  margin-bottom: 30px;
}

.header-badge {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 24px;
}

.badge-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: var(--gradient-gold);
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

.badge-icon {
  position: relative;
  z-index: 1;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.4);
  animation: badge-bounce 2s ease-in-out infinite;
}

@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.result-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.result-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.result-date {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* MBTI展示 */
.mbti-showcase {
  margin-bottom: 30px;
}

.mbti-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-lg);
  padding: 50px 40px;
  text-align: center;
  overflow: hidden;
}

.mbti-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

.mbti-content {
  position: relative;
  z-index: 1;
}

.mbti-label {
  display: block;
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.mbti-type {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--star-gold) 0%, var(--mystic-pink) 50%, var(--mystic-purple-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 6px;
}

.mbti-name {
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.mbti-traits {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.trait-tag {
  padding: 10px 20px;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 25px;
  font-size: 0.9rem;
  color: var(--mystic-purple-light);
}

.mbti-decoration {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mbti-decoration span {
  color: var(--star-gold);
  opacity: 0.3;
  font-size: 1.2rem;
}

/* 得分展示 */
.score-showcase {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.score-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
}

.score-circle {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 24px;
}

.score-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 10;
}

.score-ring-progress {
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 339.292;
  transition: stroke-dashoffset 1.5s ease;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--star-gold) 0%, var(--mystic-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-label {
  font-size: 1rem;
  color: var(--text-muted);
}

.score-rating .stars {
  margin-bottom: 8px;
}

.score-rating .star {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.2);
  margin: 0 2px;
}

.score-rating .star.filled {
  color: var(--star-gold);
}

.rating-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 报告区域 */
.report-section {
  margin-bottom: 30px;
}

.report-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 30px;
  position: relative;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
  font-size: 2rem;
}

.header-text h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.report-body {
  margin-bottom: 20px;
}

.report-text {
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--text-secondary);
  white-space: pre-line;
}

.report-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 详细分析 */
.detailed-analysis {
  margin-bottom: 30px;
}

.analysis-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 30px;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.title-icon {
  font-size: 1.5rem;
}

.dimensions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dimension {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dim-name {
  font-weight: 500;
  color: var(--text-primary);
}

.dim-score {
  font-weight: 700;
  color: var(--star-gold);
}

.dim-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.dim-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mystic-purple), var(--star-gold));
  border-radius: 4px;
  transition: width 1s ease;
}

.dim-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* 分享区域 */
.share-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.share-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.share-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.share-btn .btn-icon {
  font-size: 1.2rem;
}

/* 解锁区域 */
.unlock-section {
  margin-bottom: 30px;
}

.unlock-card {
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.08) 0%, rgba(230, 107, 155, 0.08) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
}

.unlock-header {
  margin-bottom: 30px;
}

.unlock-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.unlock-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--star-gold);
}

.unlock-desc {
  font-size: 1rem;
  color: var(--text-secondary);
}

.unlock-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 30px;
  text-align: left;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

.unlock-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.feature-icon-check {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #42b883 0%, #33a06f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
  flex-shrink: 0;
}

.unlock-price {
  margin-bottom: 24px;
}

.price-tag {
  margin-bottom: 8px;
}

.price-label {
  display: block;
  font-size: 0.9rem;
  color: var(--mystic-pink);
  margin-bottom: 8px;
}

.price-value {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.price-value .currency {
  font-size: 1.8rem;
  color: var(--star-gold);
  font-weight: 600;
}

.price-value .amount {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--star-gold) 0%, var(--mystic-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-original {
  font-size: 1rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.unlock-btn {
  padding: 18px 56px;
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.unlock-btn .sparkle {
  animation: twinkle 1.5s ease-in-out infinite;
}

.unlock-btn .sparkle:last-child {
  animation-delay: 0.3s;
}

.unlock-guarantees {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.guarantee {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 已解锁状态 */
.unlocked-section {
  margin-bottom: 30px;
}

.unlocked-card {
  background: linear-gradient(145deg, rgba(66, 184, 131, 0.1) 0%, rgba(51, 160, 111, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(66, 184, 131, 0.3);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  position: relative;
}

.unlocked-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}

.unlocked-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #42b883;
  margin-bottom: 8px;
}

.unlocked-card p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.unlocked-badge {
  display: inline-block;
  padding: 8px 24px;
  background: linear-gradient(135deg, #42b883 0%, #33a06f 100%);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

/* 推荐区域 */
.recommend-section {
  margin-bottom: 30px;
}

.recommend-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  text-align: center;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommend-item:hover {
  border-color: rgba(255, 215, 0, 0.2);
  transform: translateX(8px);
}

.item-icon {
  font-size: 2rem;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.item-info p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.item-arrow {
  font-size: 1.5rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.recommend-item:hover .item-arrow {
  color: var(--star-gold);
  transform: translateX(4px);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  font-size: 1rem;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .result-header {
    padding: 30px 0;
  }
  
  .header-badge {
    width: 70px;
    height: 70px;
  }
  
  .badge-icon {
    font-size: 2.5rem;
  }
  
  .result-title {
    font-size: 1.8rem;
  }
  
  .mbti-card {
    padding: 35px 25px;
  }
  
  .mbti-type {
    font-size: 3rem;
  }
  
  .mbti-traits {
    gap: 8px;
  }
  
  .trait-tag {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
  
  .unlock-card {
    padding: 30px 20px;
  }
  
  .unlock-features {
    grid-template-columns: 1fr;
  }
  
  .price-value .amount {
    font-size: 2.8rem;
  }
  
  .share-buttons {
    flex-direction: column;
  }
  
  .share-btn {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>