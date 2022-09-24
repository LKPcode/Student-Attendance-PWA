// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import ClassSettings from '../views/ClassSettingsView.vue'
import Class from '../views/ClassView.vue'
import SignUp from '../views/SignUpView.vue'
import Login from '../views/LoginView.vue'




const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/class-settings/:id',
        name: 'ClassSettings',
        component: ClassSettings
    },
    {
        path: '/class/:id',
        name: 'Class',
        component: Class
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router