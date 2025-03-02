
<template>
  <div
    class="inline-dialog"
    :class="{ 'is-expanded': isExpanded, 'is-chatting': isChatting }"
  >
    <!-- 收缩形态 -->
    <div
      v-if="!isExpanded"
      class="inline-dialog-collapsed"
      @click="expandDialog"
    >
      <div class="search-input">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" placeholder="搜索或提问..." readonly />
        <kbd class="keyboard-shortcut">Ctrl+K</kbd>
      </div>
    </div>

    <!-- 展开形态和对话形态 -->
    <div v-else class="inline-dialog-expanded">
      <div class="dialog-header">
        <div class="dialog-title" v-if="isChatting">对话中</div>
        <div class="dialog-title" v-else>搜索或提问</div>
        <el-button type="primary"
        @click="createNewChat"
        >
          <el-icon><Plus /></el-icon>新建对话
        </el-button>
        <el-button class="close-btn" @click="closeDialog" text>
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="dialog-content">
        <div class="messages" ref="messagesContainer">
          <div v-if="!isChatting && !store.messages.length" class="empty-state">
            <p>有什么可以帮助你的？</p>
          </div>

          <!-- 将每条消息包装在一个message-wrapper中，以更好地控制布局 -->
          <div
            v-for="(message, index) in store.messages"
            :key="index"
            class="message-wrapper"
            :class="message.type"
          >
            <div class="message" :class="message.type">
              <div class="message-content" v-html="message.content"></div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <textarea
            v-model="userInput"
            :placeholder="isChatting ? '继续输入...' : '输入你的问题...'"
            rows="1"
            @keydown.enter.prevent="handleEnter"
            @input="autoResize"
            ref="inputArea"
          ></textarea>
          <el-button
            class="send-btn"
            type="primary"
            @click="sendMessage"
            :disabled="!userInput.trim()"
          >
            <el-icon><Position /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, nextTick , watch} from "vue";
import { ChatHelper } from "../utils/chatHelper";
import { useInlineChatStore } from "../stores/inlineChat.js";

const isExpanded = ref(false);
const isChatting = ref(false);
const userInput = ref("");
const messagesContainer = ref(null);
const inputArea = ref(null);
const ConversationId = ref(null);
const store = useInlineChatStore();
const chatHelper = new ChatHelper(store);
let isNewConversation = ref(true);

// 展开对话框
const expandDialog = () => {
  isExpanded.value = true;
  nextTick(() => {
    inputArea.value?.focus();
  });
};

// 关闭对话框
const closeDialog = () => {
  isExpanded.value = false;
  isChatting.value = false;
  userInput.value = "";
};

// 处理回车发送
const handleEnter = (e) => {
  if (!e.shiftKey) {
    sendMessage();
  }
};
// 创建新对话
const createNewChat = async () => {
  isNewConversation.value = true;
  isChatting.value = false;
  ConversationId.value = null;
  store.$reset();
  expandDialog();
};
// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  try {
    const userMsg = userInput.value;
    // 清空输入框
    userInput.value = "";
    ConversationId.value = await chatHelper.handleChatMessage(
      userMsg,
      ConversationId.value,
      isNewConversation.value,
    );
    isNewConversation.value = false;
    console.log("conversationId", ConversationId.value);
  } catch (error) {
    console.error("处理消息失败:", error);
  }

  // 进入对话形态
  isChatting.value = true;

};
// 监听 store.messages 的变化，并在变化后滚动到底部
watch(
  () => store.messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = 9999999;
      }
    });
  },
  { deep: true }
);
// 输入框自适应高度
const autoResize = () => {
  const textarea = inputArea.value;
  if (!textarea) return;

  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
};

// 监听快捷键
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (!isExpanded.value) {
        expandDialog();
      }
    } else if (e.key === "Escape" && isExpanded.value) {
      closeDialog();
    }
  });
});
</script>

<style scoped>
.inline-dialog {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.inline-dialog-collapsed {
  cursor: pointer;
}

.search-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.search-icon {
  font-size: 16px;
  color: #666666;
}

.search-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
}

.keyboard-shortcut {
  padding: 2px 6px;
  font-size: 12px;
  color: #666666;
  background: #e0e0e0;
  border-radius: 4px;
}

.inline-dialog-expanded {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  max-height: 60vh;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-title {
  font-weight: 500;
  color: #333333;
}

.close-btn {
  padding: 4px;
  color: #666666;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  height: calc(60vh - 57px);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666666;
}

/* 添加消息包装器来控制整体布局 */
.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}

/* 用户消息居右 */
.message-wrapper.user {
  justify-content: flex-end;
}

/* 助手消息居左 */
.message-wrapper.assistant {
  justify-content: flex-start;
}

.message {
  max-width: 80%;
  padding: 12px;
  border-radius: 8px;
  word-break: break-word;
}

.message-content {
  width: auto;
  min-width: 50px;
  display: inline-block;
}

/* 用户消息样式 */
.message.user {
  background: #e1f3ff; /* 更亮的蓝色背景 */
  color: #333333;
  text-align: right; /* 文本右对齐 */
}

/* 助手消息样式 */
.message.assistant {
  background: #f0f0f0;
  color: #333333;
  text-align: left; /* 文本左对齐 */
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

textarea {
  flex: 1;
  min-height: 24px;
  max-height: 150px;
  padding: 8px 12px;
  margin-right: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  background: #ffffff;
  color: #333333;
}

.send-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 对话形态特定样式 */
.is-chatting .messages {
  padding-top: 8px;
}

.is-chatting .dialog-content {
  background-color: #f5f5f5;
}
</style>

