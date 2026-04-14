<template>
  <div id="app">
    <NavBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
@import './assets/main.css';

#app {
  min-height: 100vh;
  width: 100%;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  min-height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  main {
    padding: 70px 16px 30px;
  }
}
</style>
