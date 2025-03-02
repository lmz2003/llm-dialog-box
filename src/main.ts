import { createApp } from 'vue'
import App from './App.vue'
// 引入 Element Plus
import ElementPlus from 'element-plus'
// 引入 Element Plus 样式
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import "./style.css"
// 引入 highlight.js 样式
import 'highlight.js/styles/atom-one-dark.css'

// 为window对象添加copyCode方法的类型声明
declare global {
  interface Window {
    copyCode: (button: HTMLButtonElement) => void;
  }
}

// 添加全局复制函数
window.copyCode = function(button: HTMLButtonElement) {
  const codeBlock = button.parentElement?.nextElementSibling as HTMLElement;
  if (!codeBlock) return;
  
  const code = codeBlock.querySelector('code')?.innerText || '';
  
  navigator.clipboard.writeText(code).then(() => {
    // 更改按钮文本为"Copied!"
    const originalText = button.innerText;
    button.innerText = "Copied!";
    
    // 2秒后恢复原始文本
    setTimeout(() => {
      button.innerText = originalText;
    }, 2000);
  }).catch(err => {
    console.error('复制失败:', err);
  });
};

const app = createApp(App)
const pinia = createPinia()

// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
// 使用 Element Plus
app.use(ElementPlus)
app.use(pinia)
app.mount('#app')
