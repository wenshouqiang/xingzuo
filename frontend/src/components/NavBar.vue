<template>
  <div class="navbar-wrapper">
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">星座心灵测试</span>
        </router-link>

        <!-- 用户区域 -->
        <div class="user-area">
          <template v-if="authStore.user">
            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitial(authStore.user.email) }}
              </div>
              <span class="user-email">{{ maskEmail(authStore.user.email) }}</span>
            </div>
            <button class="btn btn-outline logout-btn" @click="logout">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              退出
            </button>
          </template>
          <template v-else>
            <button class="btn btn-outline" @click="showLogin = true">登录</button>
            <button class="btn btn-primary" @click="showRegister = true">注册</button>
          </template>
        </div>
      </div>
    </nav>

    <!-- 登录弹窗 - 移到nav外面 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showLogin" class="modal-overlay" @click.self="showLogin = false">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-icon">🌙</div>
              <h3>欢迎回来</h3>
              <p>登录以查看您的测试记录</p>
            </div>
            <div class="modal-body">
              <div class="input-group">
                <label>邮箱</label>
                <input 
                  v-model="loginEmail" 
                  type="email" 
                  class="input" 
                  placeholder="请输入邮箱"
                  @keyup.enter="handleLogin"
                />
              </div>
              <div class="input-group">
                <label>密码</label>
                <input 
                  v-model="loginPassword" 
                  type="password" 
                  class="input" 
                  placeholder="请输入密码"
                  @keyup.enter="handleLogin"
                />
              </div>
              <button class="btn btn-primary submit-btn" @click="handleLogin" :disabled="!loginEmail || !loginPassword">
                登录
              </button>
            </div>
            <div class="modal-footer">
              <p>还没有账号？<a @click="switchToRegister">立即注册</a></p>
            </div>
            <button class="modal-close" @click="showLogin = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 注册弹窗 - 移到nav外面 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showRegister" class="modal-overlay" @click.self="showRegister = false">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-icon">⭐</div>
              <h3>创建账号</h3>
              <p>开始您的星座探索之旅</p>
            </div>
            <div class="modal-body">
              <div class="input-group">
                <label>邮箱</label>
                <input 
                  v-model="registerEmail" 
                  type="email" 
                  class="input" 
                  placeholder="请输入邮箱"
                  @keyup.enter="handleRegister"
                />
              </div>
              <div class="input-group">
                <label>密码</label>
                <input 
                  v-model="registerPassword" 
                  type="password" 
                  class="input" 
                  placeholder="请设置密码（至少6位）"
                  @keyup.enter="handleRegister"
                />
              </div>
              <button class="btn btn-primary submit-btn" @click="handleRegister" :disabled="!registerEmail || !registerPassword || registerPassword.length < 6">
                注册
              </button>
            </div>
            <div class="modal-footer">
              <p>已有账号？<a @click="switchToLogin">立即登录</a></p>
            </div>
            <button class="modal-close" @click="showRegister = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showLogin = ref(false)
const showRegister = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const getUserInitial = (email) => {
  return email ? email.charAt(0).toUpperCase() : '?'
}

const maskEmail = (email) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  const maskedName = name.length > 2 ? name.slice(0, 2) + '***' : name
  return `${maskedName}@${domain}`
}

const switchToRegister = () => {
  showLogin.value = false
  showRegister.value = true
}

const switchToLogin = () => {
  showRegister.value = false
  showLogin.value = true
}

const handleLogin = async () => {
  if (!loginEmail.value || !loginPassword.value) return
  const result = await authStore.login(loginEmail.value, loginPassword.value)
  if (result.success) {
    showLogin.value = false
    loginEmail.value = ''
    loginPassword.value = ''
  } else {
    alert(result.message)
  }
}

const handleRegister = async () => {
  if (!registerEmail.value || !registerPassword.value || registerPassword.value.length < 6) return
  const result = await authStore.register(registerEmail.value, registerPassword.value)
  if (result.success) {
    alert('注册成功，请登录')
    switchToLogin()
    registerEmail.value = ''
    registerPassword.value = ''
  } else {
    alert(result.message)
  }
}

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
.navbar-wrapper {
  position: relative;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  font-size: 1.5rem;
  animation: twinkle 2s ease-in-out infinite;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--star-gold) 0%, var(--mystic-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.user-area .btn {
  padding: 8px 20px;
  font-size: 0.9rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn .btn-icon {
  width: 16px;
  height: 16px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
}

.modal-content {
  position: relative;
  background: linear-gradient(145deg, rgba(26, 26, 62, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

.modal-header h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.modal-header p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.modal-body {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input-group .input {
  width: 100%;
  padding: 12px 14px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.modal-footer a {
  color: var(--star-gold);
  cursor: pointer;
  transition: color 0.3s ease;
}

.modal-footer a:hover {
  color: var(--mystic-pink);
  text-decoration: underline;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-muted);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: var(--text-primary);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-container {
    padding: 10px 16px;
  }
  
  .logo-text {
    font-size: 1rem;
  }
  
  .user-email {
    display: none;
  }
  
  .user-area .btn {
    padding: 6px 14px;
    font-size: 0.85rem;
  }
  
  .modal-overlay {
    padding: 12px;
    align-items: flex-end;
  }
  
  .modal-content {
    padding: 24px 20px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-width: 100%;
    width: 100%;
  }
  
  .modal-header {
    margin-bottom: 20px;
  }
  
  .modal-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .modal-header h3 {
    font-size: 1.2rem;
  }
  
  .modal-header p {
    font-size: 0.85rem;
  }
  
  .modal-body {
    margin-bottom: 16px;
  }
  
  .input-group {
    margin-bottom: 14px;
  }
  
  .input-group label {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
  
  .input-group .input {
    padding: 10px 12px;
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 0.9rem;
  }
  
  .modal-footer {
    padding-top: 16px;
  }
  
  .modal-footer p {
    font-size: 0.85rem;
  }
  
  .modal-close {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
  }
}
</style>