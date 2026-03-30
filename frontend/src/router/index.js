import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TestView from '../views/TestView.vue'
import ResultView from '../views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/test/:testId',
      name: 'test',
      component: TestView
    },
    {
      path: '/report/:responseId',
      name: 'result',
      component: ResultView
    }
  ]
})

export default router