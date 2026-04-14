<template>
  <div class="home">
    <!-- 动态星空背景 -->
    <div class="cosmos-background">
      <div class="stars-layer">
        <span v-for="n in 50" :key="n" class="star" :style="getStarStyle(n)"></span>
      </div>
      <div class="shooting-stars">
        <span v-for="n in 3" :key="n" class="shooting-star" :style="getShootingStarStyle(n)"></span>
      </div>
      <div class="nebula"></div>
    </div>

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <div class="zodiac-ring-container">
          <div class="zodiac-ring">
            <div class="zodiac-symbols">
              <span v-for="(symbol, idx) in zodiacSymbols" :key="idx" class="zodiac-icon" :style="getZodiacStyle(idx)">
                {{ symbol }}
              </span>
            </div>
            <div class="center-glow"></div>
          </div>
        </div>
        <h1 class="hero-title">
          <span class="gradient-text">星座契合度测试</span>
        </h1>
        <p class="hero-subtitle">发现与你最契合的星座，找到属于你的灵魂伴侣</p>
        <div class="hero-stats">
          <div class="stat-item" v-for="(stat, idx) in stats" :key="idx">
            <span class="stat-number">{{ stat.number }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
        <div class="hero-cta">
          <button class="btn btn-gold cta-btn" @click="scrollToTests">
            <span>开始探索</span>
            <svg class="arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 星座介绍区域 -->
    <section class="zodiac-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">♈</span>
          十二星座
          <span class="icon">♓</span>
        </h2>
        <p class="section-desc">选择你的星座，探索与你最契合的TA</p>
      </div>
      <div class="zodiac-grid">
        <div 
          v-for="(zodiac, index) in zodiacList" 
          :key="zodiac.name"
          class="zodiac-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @mouseenter="activeZodiac = zodiac.name"
          @mouseleave="activeZodiac = null"
        >
          <div class="zodiac-glow" :class="{ active: activeZodiac === zodiac.name }"></div>
          <div class="zodiac-content">
            <span class="zodiac-symbol">{{ zodiac.symbol }}</span>
            <h3 class="zodiac-name">{{ zodiac.name }}</h3>
            <p class="zodiac-date">{{ zodiac.date }}</p>
            <div class="zodiac-traits">
              <span v-for="trait in zodiac.traits" :key="trait" class="trait">{{ trait }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 测试列表 -->
    <section class="tests-section" id="tests">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">✨</span>
          契合度测试
          <span class="icon">✨</span>
        </h2>
        <p class="section-desc">测测你和哪个星座最配，寻找你的完美伴侣</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载测试...</p>
      </div>

      <div v-else-if="tests.length === 0" class="empty-state">
        <div class="empty-icon">🌙</div>
        <p>暂无测试内容</p>
      </div>

      <div v-else class="tests-grid">
        <div 
          v-for="(test, index) in tests" 
          :key="test.id" 
          class="test-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          :class="{ featured: index === 0 }"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="test-header">
              <div class="test-icon">{{ getTestIcon(index) }}</div>
              <div class="test-badges">
                <span v-if="test.price === 0" class="badge free">免费</span>
                <span v-if="index === 0" class="badge hot">热门</span>
              </div>
            </div>
            <h3 class="test-title">{{ test.title }}</h3>
            <p class="test-description">{{ test.description }}</p>
            <div class="test-meta">
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ test.questionCount || '多' }} 题
              </span>
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {{ test.duration || '5-10' }} 分钟
              </span>
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {{ test.participants || '1000+' }} 人已测
              </span>
            </div>
            <div class="test-footer">
              <div class="price-tag">
                <!-- <span v-if="test.price === 0" class="price-free">免费</span>
                <span v-else class="price-paid">
                  <span class="currency">¥</span>
                  <span class="amount">{{ (test.price / 100).toFixed(0) }}</span>
                </span> -->
              </div>
              <button class="btn btn-primary start-btn" @click="startTest(test.id)">
                <span>开始测试</span>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色介绍 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">为什么选择我们</h2>
        <p class="section-desc">专业、科学、有趣的星座心理测试平台</p>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, idx) in features" :key="idx">
          <div class="feature-icon-wrapper">
            <span class="feature-icon">{{ feature.icon }}</span>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="reviews-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">💬</span>
          用户评价
          <span class="icon">💬</span>
        </h2>
        <p class="section-desc">听听他们怎么说</p>
      </div>
      <div class="reviews-grid">
        <div class="review-card" v-for="(review, idx) in reviews" :key="idx">
          <div class="review-stars">
            <span v-for="n in 5" :key="n" class="star-icon">★</span>
          </div>
          <p class="review-text">"{{ review.text }}"</p>
          <div class="review-author">
            <div class="author-avatar">{{ review.avatar }}</div>
            <div class="author-info">
              <span class="author-name">{{ review.name }}</span>
              <span class="author-zodiac">{{ review.zodiac }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ 区域 -->
    <section class="faq-section">
      <div class="section-header">
        <h2 class="section-title">常见问题</h2>
      </div>
      <div class="faq-list">
        <div 
          v-for="(faq, idx) in faqs" 
          :key="idx"
          class="faq-item"
          :class="{ active: activeFaq === idx }"
          @click="toggleFaq(idx)"
        >
          <div class="faq-question">
            <span class="faq-icon">{{ activeFaq === idx ? '−' : '+' }}</span>
            <span class="faq-text">{{ faq.question }}</span>
          </div>
          <div class="faq-answer" v-show="activeFaq === idx">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-card">
        <div class="cta-stars">
          <span v-for="n in 8" :key="n" class="cta-star">✦</span>
        </div>
        <h2>准备好寻找你的灵魂伴侣了吗？</h2>
        <p>立即开始测试，发现与你最契合的星座</p>
        <button class="btn btn-gold cta-main-btn" @click="scrollToTests">
          立即开始
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const tests = ref([])
const loading = ref(true)
const activeZodiac = ref(null)
const activeFaq = ref(null)

const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']

const testIcons = ['🌟', '🌙', '⭐', '💫', '✨', '🔮', '🌠', '🌌']

const stats = [
  { number: '12', label: '星座维度' },
  { number: '99+', label: '专业题目' },
  { number: '10万+', label: '用户信赖' },
  { number: '98%', label: '好评率' }
]

const zodiacList = [
  { name: '白羊座', symbol: '♈', date: '3.21-4.19', traits: ['热情', '冲动', '自信'] },
  { name: '金牛座', symbol: '♉', date: '4.20-5.20', traits: ['稳重', '务实', '耐心'] },
  { name: '双子座', symbol: '♊', date: '5.21-6.21', traits: ['机智', '多变', '好奇'] },
  { name: '巨蟹座', symbol: '♋', date: '6.22-7.22', traits: ['温柔', '敏感', '顾家'] },
  { name: '狮子座', symbol: '♌', date: '7.23-8.22', traits: ['自信', '慷慨', '领导力'] },
  { name: '处女座', symbol: '♍', date: '8.23-9.22', traits: ['完美', '细致', '理性'] },
  { name: '天秤座', symbol: '♎', date: '9.23-10.23', traits: ['优雅', '公正', '和谐'] },
  { name: '天蝎座', symbol: '♏', date: '10.24-11.22', traits: ['神秘', '专注', '深情'] },
  { name: '射手座', symbol: '♐', date: '11.23-12.21', traits: ['自由', '乐观', '冒险'] },
  { name: '摩羯座', symbol: '♑', date: '12.22-1.19', traits: ['务实', '自律', '野心'] },
  { name: '水瓶座', symbol: '♒', date: '1.20-2.18', traits: ['创新', '独立', '人道'] },
  { name: '双鱼座', symbol: '♓', date: '2.19-3.20', traits: ['浪漫', '直觉', '艺术'] }
]

const features = [
  { icon: '�', title: '星座配对', desc: '基于你的星座特质，智能匹配与你最契合的星座伴侣' },
  { icon: '🎯', title: '精准匹配', desc: '结合星座学与心理学，分析你们的性格契合度和相处模式' },
  { icon: '❤️', title: '恋爱指南', desc: '为你提供专属的恋爱建议，助你找到命中注定的TA' },
  { icon: '⚡', title: '即时结果', desc: '测试完成后立即获得契合度报告，无需等待' },
  { icon: '�', title: '隐私保护', desc: '严格保护你的个人信息和测试结果，数据加密存储' },
  { icon: '🎁', title: '免费体验', desc: '提供基础免费测试，让每个人都能寻找真爱' }
]

const reviews = [
  { text: '测试说我最适合和天秤座在一起，结果真的遇到了我的天秤男友！', name: '小雨', avatar: 'Y', zodiac: '双子座 ♊' },
  { text: '单身很久了，测试后发现原来我和处女座最配，现在已经有目标了！', name: '阿伟', avatar: 'W', zodiac: '金牛座 ♉' },
  { text: '和现在的对象测了一下契合度，分析得好准，帮我们更了解彼此了！', name: '晓琳', avatar: 'L', zodiac: '巨蟹座 ♋' }
]

const faqs = [
  { question: '星座契合度测试准吗？', answer: '我们的测试基于星座学和心理学理论，分析不同星座之间的性格互补性和相处模式。虽然不能保证100%准确，但可以为你提供有价值的参考，帮助你更好地了解与不同星座的匹配程度。' },
  { question: '单身用户适合测吗？', answer: '非常适合！很多单身用户通过我们的测试发现了与自己最契合的星座类型，在寻找伴侣时更有方向感。测试会告诉你哪些星座与你性格最配、相处最融洽。' },
  { question: '测试需要付费吗？', answer: '我们提供基础免费测试，你可以免费获得基本的星座契合度分析。完整报告需要付费解锁，包含更详细的配对分析和恋爱建议。' },
  { question: '有对象了还能测吗？', answer: '当然可以！你可以测测和现任对象的星座契合度，了解你们的性格互补点和需要注意的地方，帮助感情更加和谐美满。' }
]

const getTestIcon = (index) => testIcons[index % testIcons.length]

const getStarStyle = (n) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3}s`,
  animationDuration: `${2 + Math.random() * 2}s`,
  transform: `scale(${0.5 + Math.random()})`
})

const getShootingStarStyle = (n) => ({
  top: `${Math.random() * 50}%`,
  left: `${Math.random() * 50}%`,
  animationDelay: `${n * 2}s`,
  animationDuration: `${2 + Math.random()}s`
})

const getZodiacStyle = (idx) => ({
  transform: `rotate(${idx * 30}deg) translateY(-100px)`
})

const scrollToTests = () => {
  document.getElementById('tests')?.scrollIntoView({ behavior: 'smooth' })
}

const toggleFaq = (idx) => {
  activeFaq.value = activeFaq.value === idx ? null : idx
}

onMounted(async () => {
  try {
    const data = await request.get('/tests')
    tests.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const startTest = (testId) => {
  router.push(`/test/${testId}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
}

/* 动态星空背景 */
.cosmos-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.shooting-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shooting-star {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, white, transparent);
  animation: shooting 3s linear infinite;
  opacity: 0;
}

@keyframes shooting {
  0% {
    transform: translateX(0) translateY(0) rotate(-45deg);
    opacity: 1;
  }
  100% {
    transform: translateX(300px) translateY(300px) rotate(-45deg);
    opacity: 0;
  }
}

.nebula {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(107, 78, 230, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* 英雄区域 */
.hero {
  position: relative;
  padding: 80px 0 100px;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.zodiac-ring-container {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 0 auto 40px;
}

.zodiac-ring {
  position: relative;
  width: 100%;
  height: 100%;
}

.zodiac-symbols {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  animation: rotate 60s linear infinite;
}

.zodiac-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 28px;
  transform-origin: center;
  opacity: 0.7;
  filter: drop-shadow(0 0 8px var(--star-gold));
  transition: all 0.3s ease;
}

.zodiac-icon:hover {
  opacity: 1;
  transform: scale(1.2);
}

.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 3s ease-in-out infinite;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  flex-wrap: wrap;
  margin-bottom: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--star-gold) 0%, var(--mystic-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.hero-cta {
  margin-top: 20px;
}

.cta-btn {
  padding: 16px 40px;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.arrow-down {
  width: 20px;
  height: 20px;
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

/* 星座区域 */
.zodiac-section {
  padding: 60px 0;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.zodiac-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
  overflow: hidden;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.zodiac-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.3);
}

.zodiac-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.zodiac-glow.active {
  opacity: 1;
}

.zodiac-content {
  position: relative;
  z-index: 1;
}

.zodiac-symbol {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.zodiac-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.zodiac-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.zodiac-traits {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}

.zodiac-traits .trait {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-secondary);
}

/* 测试区域 */
.tests-section {
  padding: 60px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.section-title .icon {
  animation: twinkle 2s ease-in-out infinite;
}

.section-desc {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 80px;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.test-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.test-card.featured {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.1);
}

.test-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.1);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.test-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  padding: 28px;
  z-index: 1;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.test-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
}

.test-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.free {
  background: linear-gradient(135deg, #42b883 0%, #33a06f 100%);
  color: white;
}

.badge.hot {
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  color: white;
}

.test-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.test-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.test-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.meta-icon {
  width: 16px;
  height: 16px;
}

.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.price-tag {
  display: flex;
  align-items: baseline;
}

.price-free {
  color: #42b883;
  font-weight: 600;
  font-size: 1.2rem;
}

.price-paid {
  display: flex;
  align-items: baseline;
  color: var(--star-gold);
}

.price-paid .currency {
  font-size: 1rem;
  margin-right: 2px;
}

.price-paid .amount {
  font-size: 1.8rem;
  font-weight: 700;
}

.start-btn {
  padding: 12px 24px;
  font-size: 0.95rem;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.start-btn:hover .arrow-icon {
  transform: translateX(4px);
}

/* 特色区域 */
.features-section {
  padding: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  text-align: center;
  padding: 40px 30px;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.2);
}

.feature-icon-wrapper {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 2rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 评价区域 */
.reviews-section {
  padding: 60px 0;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.review-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 30px;
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.2);
}

.review-stars {
  margin-bottom: 16px;
}

.star-icon {
  color: var(--star-gold);
  font-size: 1.2rem;
  margin-right: 4px;
}

.review-text {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
  font-style: italic;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 44px;
  height: 44px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.author-zodiac {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* FAQ区域 */
.faq-section {
  padding: 60px 0;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: rgba(255, 215, 0, 0.2);
}

.faq-item.active {
  border-color: rgba(255, 215, 0, 0.3);
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  font-weight: 500;
  color: var(--text-primary);
}

.faq-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--star-gold);
  flex-shrink: 0;
}

.faq-answer {
  padding: 0 24px 20px 64px;
  color: var(--text-secondary);
  line-height: 1.7;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CTA区域 */
.cta-section {
  padding: 60px 0 80px;
}

.cta-card {
  position: relative;
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(230, 107, 155, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-lg);
  padding: 60px 40px;
  text-align: center;
  overflow: hidden;
}

.cta-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.cta-star {
  position: absolute;
  color: var(--star-gold);
  font-size: 20px;
  opacity: 0.3;
  animation: twinkle 2s ease-in-out infinite;
}

.cta-star:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.cta-star:nth-child(2) { top: 20%; right: 15%; animation-delay: 0.3s; }
.cta-star:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 0.6s; }
.cta-star:nth-child(4) { bottom: 15%; right: 10%; animation-delay: 0.9s; }
.cta-star:nth-child(5) { top: 50%; left: 5%; animation-delay: 1.2s; }
.cta-star:nth-child(6) { top: 50%; right: 5%; animation-delay: 1.5s; }
.cta-star:nth-child(7) { top: 30%; left: 20%; animation-delay: 1.8s; }
.cta-star:nth-child(8) { bottom: 30%; right: 20%; animation-delay: 2.1s; }

.cta-card h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

.cta-card p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.cta-main-btn {
  padding: 16px 48px;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* 响应式 - 大屏：6列 */
@media (max-width: 1200px) {
  .zodiac-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 响应式 - 中屏：4列 */
@media (max-width: 992px) {
  .zodiac-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 响应式 - 小屏：3列 */
@media (max-width: 768px) {
  .hero {
    padding: 60px 0 80px;
  }
  
  .zodiac-ring-container {
    width: 180px;
    height: 180px;
  }
  
  .zodiac-icon {
    font-size: 20px;
  }
  
  .hero-stats {
    gap: 16px;
  }
  
  .stat-item {
    padding: 15px 20px;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .zodiac-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .zodiac-card {
    padding: 16px 10px;
  }
  
  .zodiac-symbol {
    font-size: 1.5rem;
  }
  
  .zodiac-name {
    font-size: 0.85rem;
  }
  
  .zodiac-date {
    font-size: 0.7rem;
  }
  
  .zodiac-traits {
    display: none;
  }
  
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .reviews-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-card {
    padding: 40px 24px;
  }
  
  .cta-card h2 {
    font-size: 1.5rem;
  }
}

/* 响应式 - 超小屏：2列 */
@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .zodiac-card {
    padding: 14px 8px;
  }
  
  .zodiac-symbol {
    font-size: 1.3rem;
  }
  
  .zodiac-name {
    font-size: 0.8rem;
  }
}
</style>