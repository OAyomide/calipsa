import Vue from 'vue'
import VueRouter from 'vue-router'
import Chats from '../views/Chats.vue'
import Game from '../views/Game.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Join from '../views/Join.vue'


import '../assets/styles/main.css'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/chats'
  },
  {
    path: '/chats',
    name: 'Chats',
    component: Chats
  }, {
    path: '/game/:id',
    name: 'Game',
    component: Game
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/signup',
    name: 'Signup',
    component: Signup
  }, {
    path: '/game/:gameid/join',
    name: 'Join',
    component: Join
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
