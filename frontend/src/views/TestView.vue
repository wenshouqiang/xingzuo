<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <h1>{{ testTitle }}</h1>
    <div v-if="currentQuestionIndex < questions.length">
      <h3>第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</h3>
      <p>{{ questions[currentQuestionIndex].content }}</p>
      <div class="options">
        <label v-for="(opt, idx) in questions[currentQuestionIndex].options" :key="idx">
          <input type="radio" :value="idx" v-model="answers[currentQuestionIndex]" />
          {{ opt }}
        </label>
      </div>
      <button @click="nextQuestion" :disabled="answers[currentQuestionIndex] === undefined">
        {{ currentQuestionIndex === questions.length - 1 ? '提交' : '下一题' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(async () => {
  try {
    const data = await request.get(`/tests/${testId}/questions`)
    questions.value = data
    answers.value = new Array(data.length).fill(undefined)
    // 获取测试标题（从首页传过来或从接口获取，这里简化，可从本地存储获取，也可单独调用接口）
    // 我们可以在首页点击时传递标题，但为了简化，可以再调一个接口获取测试详情
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
  if (currentQuestionIndex.value === questions.value.length - 1) {
    submitAnswers()
  } else {
    currentQuestionIndex.value++
  }
}

const currentQuestionIndex = ref(0)

const submitAnswers = async () => {
  if (answers.value.some(a => a === undefined)) {
    alert('请回答所有题目');
    return;
  }
  try {
    const res = await request.post(`/tests/${testId}/submit`, { answers: answers.value });
    router.push({
      path: `/report/${res.responseId}`,
      query: {
        score: res.score,
        mbtiType: res.mbtiType,
        freeReport: encodeURIComponent(res.freeReport)
      }
    });
  } catch (err) {
    // 详细打印错误
    console.error('提交失败详情：', err);
    if (err.response) {
      // 服务器返回了错误状态码
      console.error('状态码:', err.response.status);
      console.error('返回数据:', err.response.data);
      alert(`提交失败：${err.response.status} - ${err.response.data?.error || '服务器错误'}`);
    } else if (err.request) {
      // 请求已发出但无响应
      console.error('无响应');
      alert('网络错误，请检查后端是否正常运行');
    } else {
      alert('提交失败，请稍后重试');
    }
  }
};
</script>

<style scoped>
.options {
  margin: 20px 0;
}
.options label {
  display: block;
  margin: 10px 0;
}
button {
  margin-top: 20px;
}
</style>