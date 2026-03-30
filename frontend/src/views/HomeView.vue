<template>
  <div>
    <h1>心理测试</h1>
    <div v-if="loading">加载中...</div>
    <div v-else-if="tests.length === 0">暂无测试</div>
    <div v-else>
      <div v-for="test in tests" :key="test.id" class="test-card">
        <h3>{{ test.title }}</h3>
        <p>{{ test.description }}</p>
        <p>价格：{{ (test.price / 100).toFixed(2) }} 元</p>
        <button @click="startTest(test.id)">开始测试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const tests = ref([])
const loading = ref(true)

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
.test-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.test-card h3 {
  margin-bottom: 10px;
}
.test-card p {
  margin: 8px 0;
}
</style>