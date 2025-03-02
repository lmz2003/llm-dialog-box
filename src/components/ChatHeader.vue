<template>
  <el-header class="chat-header">
    <!-- <h2>{{ store.messages[0].content }}</h2> -->
    <h2>欢迎使用</h2>
  </el-header>
  <InlineDialog />
</template>

<script>
import { useChatStore } from "../stores/chat.js";
import InlineDialog from "./InlineDialog.vue";
export default {
  name: "ChatHeader",
  // props: {
  //   title: {
  //     type: String,
  //     default: '新对话'
  //   }
  // },
  components: {
    InlineDialog,
  },
  setup() {
    const store = useChatStore();

    return {
      store,
    };
  },
};
</script>

<style scoped>
</style>