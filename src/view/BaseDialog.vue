<template>
  <el-container class="common-layout">
    <!-- 侧边栏组件，传递isCollapsed属性 -->
    <ChatAside 
      @chatSelected="handleChatSelected" 
      :isCollapsed="isAsideCollapsed" 
      @toggleCollapse="toggleAside" 
    />

    <!-- 使用整合后的 ChatMain 组件 -->
    <el-container direction="vertical">
      <ChatHeader v-if="!isNewConversation" />
      <ChatMain 
        @addMessage="handleMessage" 
        @createNewChat="createNewChat" 
      />
    </el-container>
  </el-container>
</template>
  
<script >
import { ref, provide } from "vue";
import ChatAside from "../components/ChatAside.vue";
import ChatHeader from "../components/ChatHeader.vue";
import ChatMain from "../components/ChatMain.vue";
import { Promotion } from "@element-plus/icons-vue";
import { useChatStore } from "../stores/chat.js";
import { ChatHelper } from "../utils/chatHelper";
export default {
  name: "BaseDialog",
  components: {
    ChatAside,
    ChatHeader,
    ChatMain,
  },

  setup() {
    const store = useChatStore();
    const chatHelper = new ChatHelper(store);
    let isNewConversation = ref(true);
    const newConversationId = ref(null);
    let selectedChatId = ref("");
    const isAsideCollapsed = ref(false); // 控制侧边栏收起状态

    const handleChatSelected = (chatId) => {
      console.log("Selected chat ID:", chatId);
      selectedChatId.value = chatId;
    };

    const handleMessage = async (userMsg, fileInfo = null) => {
      try {
        await chatHelper.handleChatMessage(userMsg, selectedChatId.value, false, fileInfo);
      } catch (error) {
        console.error("处理消息失败:", error);
      }
    };

    const createNewChat = async (message, fileInfo = null) => {
      isNewConversation.value = false;
      try {
        const conversationId = await chatHelper.handleChatMessage(message, null, true, fileInfo);
        newConversationId.value = conversationId;
        console.log("newConversationId", newConversationId.value);
      } catch (error) {
        console.error("创建新对话失败:", error);
      }
    };

    // 切换侧边栏收起状态
    const toggleAside = () => {
      isAsideCollapsed.value = !isAsideCollapsed.value;
    };

    provide("newConversationId", newConversationId);
    provide("isNewConversation", isNewConversation);

    return {
      createNewChat,
      handleMessage,
      handleChatSelected,
      store,
      Promotion,
      isNewConversation,
      isAsideCollapsed,
      toggleAside,
    };
  },
};
</script>
  
<style scoped>
.common-layout {
  height: 100%;
}
</style>