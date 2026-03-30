import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',  // 开发时会被 vite 代理到后端，生产环境需配置
  timeout: 10000
})

// 请求拦截器：自动添加 token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：处理 401 等
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // token 失效，清除本地存储并跳转到首页（可自行扩展）
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default request