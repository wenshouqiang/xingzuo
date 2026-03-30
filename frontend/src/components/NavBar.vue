<template>
  <nav>
    <div class="logo">心理测试</div>
    <div class="user-area">
      <div v-if="authStore.user">
        <span>{{ authStore.user.email }}</span>
        <button @click="logout">退出</button>
      </div>
      <div v-else>
        <button @click="showLogin = true">登录</button>
        <button @click="showRegister = true">注册</button>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <div v-if="showLogin" class="modal">
      <div class="modal-content">
        <h3>登录</h3>
        <input v-model="loginEmail" placeholder="邮箱" />
        <input v-model="loginPassword" type="password" placeholder="密码" />
        <button @click="handleLogin">登录</button>
        <button @click="showLogin = false">取消</button>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <div v-if="showRegister" class="modal">
      <div class="modal-content">
        <h3>注册</h3>
        <input v-model="registerEmail" placeholder="邮箱" />
        <input v-model="registerPassword" type="password" placeholder="密码" />
        <button @click="handleRegister">注册</button>
        <button @click="showRegister = false">取消</button>
      </div>
    </div>
  </nav>
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

const handleLogin = async () => {
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
  const result = await authStore.register(registerEmail.value, registerPassword.value)
  if (result.success) {
    alert('注册成功，请登录')
    showRegister.value = false
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
nav {
  background: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b883;
}
.user-area button {
  margin-left: 10px;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}
.modal-content input {
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>