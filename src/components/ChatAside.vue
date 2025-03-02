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
            <template v-if="chat.id === editingId">
              <el-input
                v-model="editingTitle"
                size="small"
                @keyup.enter="handleRenameConfirm(chat.id)"
                @blur="handleRenameConfirm(chat.id)"
                @click.stop
                ref="inputRef"
                class="edit-input"
                v-focus
              />
            </template>
            <span v-else class="chat-title">{{ chat.title }}</span>
            <el-dropdown trigger="click" class="more-dropdown" @click.stop>
              <el-button class="more-button" size="small" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleRename(chat.id)">
                    <el-icon><Edit /></el-icon>重命名
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(chat.id)">
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { ref, inject, watch, onMounted, nextTick } from "vue";
import {
  Plus,
  ChatRound,
  MoreFilled,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import { queryMsgList } from "../api/message.js";
import { useChatStore } from "../stores/chat.js";
import { marked } from "marked";
import { ElMessage } from "element-plus";

export default {
  name: "ChatAside",
  setup(props, { emit }) {
    const store = useChatStore();
    const chatList = ref([]);
    const activeChat = ref("1");
    const newConversationId = inject("newConversationId");
    const isNewConversation = inject("isNewConversation");
    const editingId = ref(null);
    const editingTitle = ref("");
    const inputRef = ref(null);

    // 从本地存储加载 chatList
    onMounted(() => {
      const savedChatList = localStorage.getItem("chatList");
      if (savedChatList) {
        chatList.value = JSON.parse(savedChatList);
        // 确保列表是倒序的
        // chatList.value.reverse();
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
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
        store.messages = response.data.data.map((item) => {
          if (item.role === "assistant") {
            return {
              type: item.role,
              content: marked(item.content),
            }
          }
          else{
            if(item.content_type === 'text'){
              return {
                type: item.role,
                content: item.content,
              }
            }else if(item.content_type === 'object_string'){
              const content = JSON.parse(item.content)
              console.log("🚀 ~ store.messages=response.data.data.map ~ content:", content)
              const files = content.filter(item => item.type !== 'text')
              console.log("🚀 ~ files ~ files:", files)
              const file = files.map(item => {
                item.size = formatFileSize(item.size);
                return item;
              })
              return {
                type: item.role,
                content: content[0].text,
                files: file
              }
            }
          }
        });

        emit("chatSelected", query);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const handleRename = async (chatId) => {
      const chat = chatList.value.find((item) => item.id === chatId);
      if (chat) {
        editingId.value = chatId;
        editingTitle.value = chat.title;
        await nextTick();
        inputRef.value?.focus();
      }
    };

    const handleRenameConfirm = (chatId) => {
      if (!editingTitle.value.trim()) {
        ElMessage({
          message: "对话名称不能为空",
          type: "warning",
          duration: 2000,
        });
        editingTitle.value =
          chatList.value.find((item) => item.id === chatId)?.title || "";
        return;
      }
      const chatIndex = chatList.value.findIndex((item) => item.id === chatId);
      if (chatIndex !== -1) {
        chatList.value[chatIndex].title = editingTitle.value.trim();
      }
      editingId.value = null;
      editingTitle.value = "";
    };

    const handleDelete = (chatId) => {
      const chatIndex = chatList.value.findIndex((item) => item.id === chatId);
      if (chatIndex !== -1) {
        chatList.value.splice(chatIndex, 1);
        // 如果删除的是当前选中的对话，则重置状态
        if (activeChat.value === String(chatId)) {
          store.$reset();
          isNewConversation.value = true;
        }
      }
    };

    watch(newConversationId, (newId) => {
      if (newId) {
        const newChat = {
          id: newId,
          title: store.messages[0]?.content || "新对话",
        };
        chatList.value.unshift(newChat);
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
      handleRename,
      formatFileSize,
      handleDelete,
      editingId,
      editingTitle,
      inputRef,
      handleRenameConfirm,
    };
  },
  directives: {
    focus: {
      mounted(el) {
        el.querySelector("input").focus();
      },
    },
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
  width: 100%;
  border-right: none;
  background-color: aliceblue;
}
.chat-menu-item {
  width: 95%;
  height: 45px;
  background-color: aliceblue;
  border-radius: 15px;
  position: relative;
}
.chat-menu-item:hover {
  width: 95%;
  background-color: #b0c4de;
  border-radius: 15px;
}
.chat-title {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.more-dropdown {
  position: absolute;
  right: 10px;
  display: none;
}

.chat-menu-item:hover .more-dropdown {
  display: block;
}

.more-button {
  padding: 4px;
  height: 24px;
  border: none;
  background: transparent;
}

.edit-input {
  max-width: 70%;
  margin-right: 20px;
}

.edit-input :deep(.el-input__wrapper) {
  background-color: white;
}
</style>