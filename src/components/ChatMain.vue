<template>
  <el-main class="chat-main">
    <!-- 聊天记录区域 -->
    <el-scrollbar ref="scrollbarRef" class="chat-messages">
      <div class="chat-message-center">
        <div
          v-for="(message, index) in store.messages"
          :key="index"
          :class="['message', message.type]"
        >
          <el-avatar
            :size="40"
            :icon="message.type === 'user' ? UserFilled : Service"
          />
          <div class="content">
            {{ message.content }}
          </div>
        </div>
      </div>
    </el-scrollbar>

    <!-- 输入区域 -->
    <div class="chat-input-container">
      <textarea
        v-model="userInput"
        rows="4"
        placeholder="给 ChatRobot 发送消息"
        class="chat-input"
        @keyup.enter="sendMessage"
      ></textarea>
      <el-button
        type="primary"
        @click="sendMessage"
        class="send-button"
        :icon="Promotion"
      />
    </div>

    <span class="notice">内容由AI生成，请仔细甄别</span>
  </el-main>
</template>

<script>
import { ref } from "vue";
import { UserFilled, Service } from "@element-plus/icons-vue";
import { Promotion } from "@element-plus/icons-vue";
import { useChatStore } from "../stores/chat.js";
export default {
  name: "ChatMain",
  setup(props, { emit }) {
    const store = useChatStore();
    const userInput = ref("");
    const scrollbarRef = ref(null);
    
    const sendMessage = async (message) => {
      if (!userInput.value.trim()) return;
      message = userInput.value;
      userInput.value = "";
      emit("addMessage", message);

      // 滚动到底部
      setTimeout(() => {
        scrollbarRef.value.setScrollTop(99999);
      }, 100);
    };

    return {
      store,
      userInput,
      scrollbarRef,
      sendMessage,
      UserFilled,
      Service,
      Promotion,
    };
  },
};
</script>

<style scoped>
.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.chat-messages {
  flex: 1 1 auto;
  overflow-y: auto;
}
.chat-message-center {
  width: 60%; /* 设置宽度为60% */
  margin: 0 auto; /* 内容居中显示 */
}

.message {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.message.user {
  flex-direction: row-reverse;
}

.message .content {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  background-color: #f5f5f5;
  margin: 0 10px;
}

.message.user .content {
  background-color: aliceblue;
}

.notice {
  font-size: small;
  margin-top: 20px;
}

.chat-input-container {
  position: relative;
  /* bottom: 10px; */
  left: 50%;
  transform: translateX(-50%);
  background-color: #f0f0f0; /* 灰色背景 */
  width: 50%;
  border-radius: 30px;
  padding: 10px;
}

.chat-input {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0; /* 灰色背景 */
  border: none;
  padding: 10px;
  box-sizing: border-box;
  resize: none;
  outline: none;
  font-size: 20px;
}

.chat-input::placeholder {
  font-size: 20px; /* 设置提示消息字体大小 */
  color: #888;
}
.send-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>