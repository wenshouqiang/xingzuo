import { defineStore } from 'pinia'
import request from '@/api/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  actions: {
    async login(email, password) {
      try {
        const res = await request.post('/auth/login', { email, password })
        this.token = res.token
        this.user = res.user
        localStorage.setItem('token', this.token)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.error || '登录失败' }
      }
    },
    async register(email, password) {
      try {
        await request.post('/auth/register', { email, password })
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.error || '注册失败' }
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})