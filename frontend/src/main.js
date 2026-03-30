import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './api/request' // 初始化 axios 拦截器

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
