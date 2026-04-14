<template>
  <div class="test-view">
    <!-- 动态背景 -->
    <div class="test-background">
      <div class="floating-shapes">
        <span v-for="n in 6" :key="n" class="shape" :class="`shape-${n}`"></span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-crystal">
        <div class="crystal-inner">🔮</div>
        <div class="crystal-glow"></div>
      </div>
      <p class="loading-text">正在加载测试...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div v-else class="test-container">
      <!-- 测试头部 -->
      <header class="test-header">
        <div class="header-decoration">
          <span class="deco-star">✦</span>
          <span class="deco-star">✦</span>
          <span class="deco-star">✦</span>
        </div>
        <div class="header-icon-wrapper">
          <div class="header-icon">🔮</div>
          <div class="icon-ripple"></div>
        </div>
        <h1 class="test-title">{{ testTitle }}</h1>
        <p class="test-progress-text">
          <span class="current">{{ currentQuestionIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ questions.length }}</span>
        </p>
      </header>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
          ></div>
          <div class="progress-shine"></div>
        </div>
        <div class="steps-wrapper">
          <div class="progress-steps" ref="stepsContainer">
            <div 
              v-for="(q, idx) in questions" 
              :key="idx"
              class="step"
              :class="{ 
                completed: idx < currentQuestionIndex,
                current: idx === currentQuestionIndex,
                pending: idx > currentQuestionIndex
              }"
              @click="goToQuestion(idx)"
              :ref="el => { if (idx === currentQuestionIndex) currentStepEl = el }"
            >
              <div class="step-dot">
                <span v-if="idx < currentQuestionIndex" class="check">✓</span>
                <span v-else>{{ idx + 1 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目区域 -->
      <TransitionGroup name="question" tag="div" class="question-wrapper">
        <div 
          v-if="currentQuestionIndex < questions.length" 
          :key="currentQuestionIndex"
          class="question-container"
        >
          <div class="question-card">
            <div class="card-shine"></div>
            <div class="question-badge">
              <span class="badge-number">{{ currentQuestionIndex + 1 }}</span>
              <span class="badge-label">题</span>
            </div>
            
            <h2 class="question-content">{{ questions[currentQuestionIndex].content }}</h2>
            
            <div class="options-list">
              <TransitionGroup name="option">
                <label 
                  v-for="(opt, idx) in questions[currentQuestionIndex].options" 
                  :key="idx"
                  class="option-item"
                  :class="{ 
                    selected: answers[currentQuestionIndex] === idx,
                    'has-answer': answers[currentQuestionIndex] !== undefined
                  }"
                  :style="{ animationDelay: `${idx * 0.1}s` }"
                >
                  <input 
                    type="radio" 
                    :value="idx" 
                    v-model="answers[currentQuestionIndex]"
                    class="option-input"
                  />
                  <div class="option-content">
                    <span class="option-marker">{{ String.fromCharCode(65 + idx) }}</span>
                    <span class="option-text">{{ opt }}</span>
                  </div>
                  <div class="option-effects">
                    <div class="effect-glow"></div>
                    <div class="effect-border"></div>
                  </div>
                  <div class="selected-indicator" v-if="answers[currentQuestionIndex] === idx">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </label>
              </TransitionGroup>
            </div>
          </div>

          <!-- 导航按钮 -->
          <div class="nav-buttons">
            <button 
              v-if="currentQuestionIndex > 0" 
              class="btn btn-outline nav-btn prev"
              @click="prevQuestion"
            >
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>上一题</span>
            </button>
            
            <div class="nav-spacer" v-else></div>
            
            <button 
              v-if="currentQuestionIndex < questions.length - 1"
              class="btn btn-primary nav-btn next"
              @click="nextQuestion"
              :disabled="answers[currentQuestionIndex] === undefined"
              :class="{ 'btn-disabled': answers[currentQuestionIndex] === undefined }"
            >
              <span>下一题</span>
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button 
              v-else
              class="btn btn-gold nav-btn submit"
              @click="submitAnswers"
              :disabled="answers[currentQuestionIndex] === undefined"
              :class="{ 'btn-disabled': answers[currentQuestionIndex] === undefined }"
            >
              <span class="sparkle-left">✨</span>
              <span>提交测试</span>
              <span class="sparkle-right">✨</span>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 答题统计 -->
      <div class="answer-stats">
        <div class="stat answered">
          <span class="stat-dot"></span>
          <span>已答 {{ answeredCount }} 题</span>
        </div>
        <div class="stat remaining">
          <span class="stat-dot"></span>
          <span>剩余 {{ remainingCount }} 题</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/api/request'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const testId = route.params.testId

const testTitle = ref('')
const questions = ref([])
const answers = ref([])
const loading = ref(true)
const currentQuestionIndex = ref(0)
const stepsContainer = ref(null)
const currentStepEl = ref(null)

const answeredCount = computed(() => answers.value.filter(a => a !== undefined).length)
const remainingCount = computed(() => questions.value.length - answeredCount.value)

// 监听当前题目变化，自动滚动到中间
watch(currentQuestionIndex, async () => {
  await nextTick()
  scrollToCurrentStep()
})

const scrollToCurrentStep = () => {
  if (!stepsContainer.value || !currentStepEl.value) return
  
  const container = stepsContainer.value
  const step = currentStepEl.value
  const containerWidth = container.offsetWidth
  const stepWidth = step.offsetWidth
  const stepLeft = step.offsetLeft
  
  // 计算滚动位置，让当前步骤居中
  const scrollPosition = stepLeft - (containerWidth / 2) + (stepWidth / 2)
  
  container.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  })
}

onMounted(async () => {
  try {
    const data = await request.get(`/tests/${testId}/questions`)
    questions.value = data
    answers.value = new Array(data.length).fill(undefined)
    const tests = await request.get('/tests')
    const test = tests.find(t => t.id == testId)
    testTitle.value = test?.title || '心理测试'
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (idx) => {
  currentQuestionIndex.value = idx
}

const submitAnswers = async () => {
  if (answers.value.some(a => a === undefined)) {
    const unanswered = answers.value.findIndex(a => a === undefined) + 1
    alert(`请回答第 ${unanswered} 题后再提交`)
    currentQuestionIndex.value = unanswered - 1
    return
  }
  
  try {
    const res = await request.post(`/tests/${testId}/submit`, { answers: answers.value })
    router.push({
      path: `/report/${res.responseId}`,
      query: {
        score: res.score,
        mbtiType: res.mbtiType,
        freeReport: encodeURIComponent(res.freeReport)
      }
    })
  } catch (err) {
    console.error('提交失败详情：', err)
    if (err.response) {
      alert(`提交失败：${err.response.status} - ${err.response.data?.error || '服务器错误'}`)
    } else if (err.request) {
      alert('网络错误，请检查后端是否正常运行')
    } else {
      alert('提交失败，请稍后重试')
    }
  }
}
</script>

<style scoped>
.test-view {
  min-height: calc(100vh - 140px);
  padding: 20px 0;
  position: relative;
}

/* 动态背景 */
.test-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: rgba(107, 78, 230, 0.4);
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: rgba(230, 107, 155, 0.3);
  top: 60%;
  right: -5%;
  animation-delay: -5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: rgba(78, 155, 230, 0.3);
  bottom: 10%;
  left: 20%;
  animation-delay: -10s;
}

.shape-4 {
  width: 350px;
  height: 350px;
  background: rgba(255, 215, 0, 0.15);
  top: 30%;
  right: 10%;
  animation-delay: -15s;
}

.shape-5 {
  width: 200px;
  height: 200px;
  background: rgba(102, 126, 234, 0.3);
  bottom: 30%;
  right: 30%;
  animation-delay: -7s;
}

.shape-6 {
  width: 280px;
  height: 280px;
  background: rgba(118, 75, 162, 0.25);
  top: 50%;
  left: 50%;
  animation-delay: -12s;
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

.loading-crystal {
  position: relative;
  width: 100px;
  height: 100px;
}

.crystal-inner {
  font-size: 4rem;
  animation: crystal-float 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
}

@keyframes crystal-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

.crystal-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: var(--star-gold);
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 测试容器 */
.test-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 头部样式 */
.test-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.header-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.deco-star {
  color: var(--star-gold);
  font-size: 1.2rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

.deco-star:nth-child(2) { animation-delay: 0.3s; }
.deco-star:nth-child(3) { animation-delay: 0.6s; }

.header-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.header-icon {
  font-size: 3.5rem;
  position: relative;
  z-index: 1;
  animation: crystal-float 3s ease-in-out infinite;
}

.icon-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.test-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.test-progress-text {
  font-size: 1.2rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.test-progress-text .current {
  font-size: 2rem;
  font-weight: 700;
  color: var(--star-gold);
}

.test-progress-text .separator {
  font-size: 1.5rem;
  opacity: 0.5;
}

.test-progress-text .total {
  font-size: 1.2rem;
  opacity: 0.7;
}

/* 进度条 */
.progress-container {
  margin-bottom: 30px;
}

.progress-track {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mystic-purple) 0%, var(--mystic-pink) 50%, var(--star-gold) 100%);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-shine {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

/* 步骤轮播容器 */
.steps-wrapper {
  position: relative;
  overflow: hidden;
  padding: 8px 0;
}

.steps-wrapper::before,
.steps-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
  z-index: 2;
}

.steps-wrapper::before {
  left: 0;
  background: linear-gradient(90deg, var(--cosmos-deep), transparent);
}

.steps-wrapper::after {
  right: 0;
  background: linear-gradient(-90deg, var(--cosmos-deep), transparent);
}

.progress-steps {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  padding: 4px 40px;
}

.progress-steps::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.step {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step.pending .step-dot {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.step.current .step-dot {
  background: var(--gradient-primary);
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  animation: pulse-glow 2s ease-in-out infinite;
  transform: scale(1.1);
}

.step.completed .step-dot {
  background: linear-gradient(135deg, #42b883 0%, #33a06f 100%);
  border: 2px solid transparent;
  color: white;
}

.step.completed .check {
  font-size: 1rem;
}

/* 题目切换动画 */
.question-wrapper {
  position: relative;
}

.question-enter-active,
.question-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.question-leave-to {
  opacity: 0;
  transform: translateX(-50px);
  position: absolute;
  width: 100%;
}

/* 题目卡片 */
.question-container {
  animation: fadeIn 0.5s ease;
}

.question-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 40px;
  margin-bottom: 30px;
  overflow: hidden;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: left 0.5s ease;
}

.question-card:hover .card-shine {
  left: 100%;
}

.question-badge {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 30px;
}

.badge-number {
  width: 50px;
  height: 50px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.badge-label {
  font-size: 1rem;
  color: var(--text-muted);
}

.question-content {
  font-size: 1.3rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 40px;
  color: var(--text-primary);
  padding: 0 20px;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 215, 0, 0.2);
  transform: translateX(8px);
}

.option-item.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: var(--mystic-purple-light);
}

.option-input {
  position: absolute;
  opacity: 0;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.option-marker {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.option-item:hover .option-marker {
  background: rgba(255, 215, 0, 0.15);
  color: var(--star-gold);
}

.option-item.selected .option-marker {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.option-text {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.option-item:hover .option-text {
  color: var(--text-primary);
}

.option-item.selected .option-text {
  color: var(--text-primary);
  font-weight: 500;
}

.option-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.effect-glow {
  position: absolute;
  top: 50%;
  left: 0;
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, var(--mystic-purple), var(--star-gold));
  transform: translateY(-50%);
  transition: height 0.3s ease;
}

.option-item.selected .effect-glow {
  height: 70%;
}

.selected-indicator {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: var(--mystic-purple-light);
  animation: check-pop 0.3s ease;
}

@keyframes check-pop {
  0% { transform: translateY(-50%) scale(0); }
  50% { transform: translateY(-50%) scale(1.2); }
  100% { transform: translateY(-50%) scale(1); }
}

/* 导航按钮 */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  font-size: 1rem;
  min-width: 140px;
  justify-content: center;
}

.nav-btn.prev {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
}

.nav-btn.prev:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: var(--text-primary);
}

.nav-btn.next {
  background: var(--gradient-primary);
}

.nav-btn.submit {
  background: var(--gradient-gold);
  font-weight: 600;
  padding: 16px 32px;
}

.sparkle-left,
.sparkle-right {
  animation: twinkle 1.5s ease-in-out infinite;
}

.sparkle-right {
  animation-delay: 0.3s;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* 答题统计 */
.answer-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stat.answered .stat-dot {
  background: linear-gradient(135deg, #42b883 0%, #33a06f 100%);
  box-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
}

.stat.remaining .stat-dot {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .test-view {
    padding: 10px 0;
  }
  
  .question-card {
    padding: 28px 20px;
  }
  
  .question-content {
    font-size: 1.15rem;
    padding: 0;
    margin-bottom: 30px;
  }
  
  .option-content {
    padding: 16px 18px;
  }
  
  .option-marker {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .option-text {
    font-size: 0.95rem;
  }
  
  .nav-buttons {
    flex-direction: column;
  }
  
  .nav-btn {
    width: 100%;
  }
  
  .nav-spacer {
    display: none;
  }
  
  .progress-steps {
    display: none;
  }
  
  .answer-stats {
    gap: 20px;
    padding: 16px;
  }
}
</style>