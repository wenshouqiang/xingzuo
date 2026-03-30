<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <h1>测试结果</h1>
    <p v-if="mbtiType">你的 MBTI 类型：{{ mbtiType }}</p>
<p v-else>你的得分：{{ score }}</p>
    <div class="report">
      <h3>报告</h3>
      <p>{{ report }}</p>
    </div>
    <div v-if="!isPaid" class="pay-section">
      <p>完整报告需要付费解锁</p>
      <button @click="payForReport">解锁完整报告（{{ (price / 100).toFixed(2) }} 元）</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/api/request'

const mbtiType = ref('')
const route = useRoute()
const router = useRouter()
const responseId = route.params.responseId

const scoreParam = route.query.score
const mbtiTypeParam = route.query.mbtiType
const freeReportParam = route.query.freeReport
const successParam = route.query.success

const loading = ref(true)
const score = ref(scoreParam || 0)
const report = ref('')
const isPaid = ref(false)
const price = ref(0) // 价格从哪来？需要后端在报告接口中返回

onMounted(async () => {
  // 如果 query 中已有免费报告，直接使用
  if (freeReportParam) {
    score.value = Number(scoreParam) || 0
    mbtiType.value = mbtiTypeParam || ''
    report.value = decodeURIComponent(freeReportParam)
    // 价格暂时从后端获取或写死，可调用一个轻量接口获取，这里先设为 500 分（5元）
    price.value = 500
    loading.value = false
  }
  // 如果支付成功回调，需要重新获取完整报告
  if (successParam === 'true') {
    await fetchReport()
    router.replace(`/report/${responseId}`)
  }
  if (!freeReportParam && !successParam) {
    // 没有免费报告且不是支付回调，说明用户直接访问结果页，需要请求报告（一般不会发生）
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
    // 价格：可以从后端返回，这里假设后端返回 price 字段
    price.value = res.price || 5 // 临时
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
    // 可以在这里打开登录弹窗（需配合全局状态），简单起见先提示
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
</script>

<style scoped>
.report {
  margin: 20px 0;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
}
.pay-section {
  margin-top: 20px;
  text-align: center;
}
</style>