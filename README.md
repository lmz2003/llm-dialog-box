# Vue 3 + JavaScript(TypeScript) + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
## 主页面
![image](https://github.com/user-attachments/assets/cc6e7773-3a18-4259-8ebe-d4b2e3ce6d71)
## 对话详情页
![image](https://github.com/user-attachments/assets/b0e17579-a415-4e43-8113-42266f3ba662)
## 内联对话框

![image](https://github.com/user-attachments/assets/95e654e3-a0b8-43f5-aaa7-5b50afbb6e3f)

![image](https://github.com/user-attachments/assets/7f992484-7b7b-42a6-8060-596d33ee808c)

### 注意事项
使用这个项目需要在coze官网获取个人令牌和智能体id
const token: string = '*******';
const botId: string = '*******';

会话历史记录id采用浏览器本地存储

### 项目目录结构
- service：保存了一下coze api发起对话和流式响应的示例代码，搭建了一个node服务用于请求api。（！其实项目中没有用到这一部分）
- src/api: 封装了和coze对话的api，包括创建会话、发起对话、查看消息列表、上传文件等。
- src/view: 写了一个基础组件BaseDialog，包括三个子组件ChatAside、ChatHeader、ChatMain。
- src/components: 包括上面提到的三个子组件，以及一个内联对话框的组件，该组件包含三种形态：收缩、展开、对话，但不支持独立对话框所有的添加附件的能力。
- src/stores: 里面有两个仓库，分别存储独立对话框和内联对话框的消息列表，比较简单。
- src/utils: 封装了两个工具，request对axios进行了封装，chatHelper对消息处理过程进行了封装。

### 不足
因为一开始没有考虑好框架，以及还未学习Taro框架，所以暂不兼容H5和小程序形态

### 后续计划
还没学习封装组件库，打算以后尝试封装一下。
