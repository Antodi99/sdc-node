
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import ViewArticle from '../pages/ViewArticle.vue'
import CreateArticle from '../pages/CreateArticle.vue'
import EditArticle from '../pages/EditArticle.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/articles/:id', name: 'view', component: ViewArticle },
  { path: '/articles/:id/edit', name: 'edit', component: EditArticle },
  { path: '/create', name: 'create', component: CreateArticle }
]

export default createRouter({ history: createWebHistory(), routes })
