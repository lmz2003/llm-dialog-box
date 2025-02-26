<template>
  <el-aside class="chat-aside">
    <div class="chat-aside-header">
      <h2>ChatRobot</h2>
      <el-button
        type="primary"
        class="new-chat-btn"
        block
        @click="createNewChat"
      >
        <el-icon><Plus /></el-icon>新建对话
      </el-button>
    </div>
    <div class="chat-aside-history">
      <el-scrollbar>
        <el-menu
          class="chat-menu"
          :default-active="activeChat"
          @select="handleSelect"
        >
          <el-menu-item
            v-for="chat in chatList"
            :key="chat.id"
            :index="String(chat.id)"
            class="chat-menu-item"
            @click="handleItemClick(chat.id)"
          >
            <el-icon><ChatRound /></el-icon>
            <span>{{ chat.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="chat-aside-foot">
      <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      />
      <h3>欢迎使用</h3>
    </div>
  </el-aside>
</template>

<script>
import { ref, inject, watch, onMounted } from "vue";
import { Plus, ChatRound } from "@element-plus/icons-vue";
import { queryMsgList } from "../api/message.js";
import { useChatStore } from "../stores/chat.js";

export default {
  name: "ChatAside",
  setup(props, { emit }) {
    const store = useChatStore();
    const chatList = ref([]);
    const activeChat = ref("1");
    const newConversationId = inject("newConversationId");
    const isNewConversation = inject("isNewConversation");

    // 从本地存储加载 chatList
    onMounted(() => {
      const savedChatList = localStorage.getItem("chatList");
      if (savedChatList) {
        chatList.value = JSON.parse(savedChatList);
      }
    });

    // 监听 chatList 的变化并保存到本地存储
    watch(
      chatList,
      (newChatList) => {
        localStorage.setItem("chatList", JSON.stringify(newChatList));
      },
      { deep: true }
    );

    const handleSelect = (index) => {
      activeChat.value = index;
      // isNewConversation.value = false;
    };

    const createNewChat = () => {
      isNewConversation.value = true;
      store.$reset();
    };

    const handleItemClick = async (query) => {
      isNewConversation.value = false;
      const data = {
        order: "asc",
      };
      console.log(query);
      try {
        const response = await queryMsgList(data, query);
        console.log("根据会话id查询的消息列表", response.data); // 处理响应数据

        // store.messages = response.data.data;

        // 将 role 和 content 分别存入 store.messages
        store.messages = response.data.data.map((item) => ({
          type: item.role,
          content: item.content,
        }));

        emit("chatSelected", query);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    watch(newConversationId, (newId) => {
      if (newId) {
        const newChat = {
          id: newId,
          title: store.messages[0]?.content || "新对话",
        };
        chatList.value.push(newChat);
        activeChat.value = String(newId);
      }
    });

    return {
      store,
      chatList,
      activeChat,
      handleSelect,
      createNewChat,
      handleItemClick,
      Plus,
      ChatRound,
    };
  },
};
</script>
<style scoped>
.chat-aside {
  background-color: aliceblue;
  width: 15%;
  height: 100%;
}
.chat-aside-header {
  height: 10%;
  padding: 16px;
}
.chat-aside-history {
  height: 75%;
  background-color: aliceblue;
}
.chat-aside-foot {
  height: 10%;
}
.new-chat-btn {
  margin: 0 16px 20px;
}

.chat-menu {
  border-right: none;
}
.chat-menu-item {
  background-color: aliceblue;
}
.chat-menu-item:hover {
  background-color: #b0c4de; /* 颜色变深 */
  border-radius: 15px;
}
</style>