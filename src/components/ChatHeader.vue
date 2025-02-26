<template>
  <el-header class="chat-header">
    <!-- <h2>{{ store.messages[0].content }}</h2> -->
    <h2>欢迎使用</h2>
  </el-header>
</template>

<script>

import { useChatStore } from "../stores/chat.js";
export default {
  name: 'ChatHeader',
  // props: {
  //   title: {
  //     type: String,
  //     default: '新对话'
  //   }
  // },

  setup() {
    const store = useChatStore();
    
    return {
      store,
    };
  },
}
</script>

<style scoped>



</style>