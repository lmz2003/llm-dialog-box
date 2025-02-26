import { createApp } from 'vue'
import App from './App.vue'
// 引入 Element Plus
import ElementPlus from 'element-plus'
// 引入 Element Plus 样式
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()
// 使用 Element Plus
app.use(ElementPlus)
app.use(pinia)
app.mount('#app')
