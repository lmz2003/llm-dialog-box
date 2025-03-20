<template>
  <el-aside class="chat-aside" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 展开状态下的完整侧边栏 -->
    <template v-if="!isCollapsed">
      <div class="chat-aside-headertop">
        <h2>ChatRobot</h2>

        <div class="collapse-button" @click="handleToggleCollapse">
          <el-icon v-if="isCollapsed"><ArrowRight /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </div>
      </div>

      <div class="chat-aside-header">
        <el-button type="primary" class="new-chat-btn" @click="createNewChat">
          <el-icon><Plus /></el-icon>开启新对话
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
    </template>

    <!-- 收起状态下只显示图标按钮 -->
    <template v-else>
      <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      />
      <el-tooltip content="展开侧边栏" placement="right">
        <div class="collapse-button" @click="handleToggleCollapse">
          <el-icon v-if="isCollapsed"><ArrowRight /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </div>
      </el-tooltip>
      <div class="collapsed-icons">
        <el-tooltip content="开始新对话" placement="right">
          <el-button
            type="primary"
            class="icon-btn"
            circle
            @click="createNewChat"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </template>
  </el-aside>
</template>

<script>
import { ref, inject, watch, onMounted, nextTick } from "vue";
import { queryMsgList } from "../api/message.js";
import { useChatStore } from "../stores/chat.js";
import { marked } from "marked";
import { ElMessage } from "element-plus";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  ChatSquare,
  Setting,
} from "@element-plus/icons-vue";

export default {
  name: "ChatAside",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useChatStore();
    const chatList = ref([]);
    const activeChat = ref("1");
    const newConversationId = inject("newConversationId");
    const isNewConversation = inject("isNewConversation");
    const editingId = ref(null);
    const editingTitle = ref("");
    const inputRef = ref(null);

    // 处理收起/展开
    const handleToggleCollapse = () => {
      emit("toggleCollapse");
    };

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
    };

    const createNewChat = () => {
      isNewConversation.value = true;
      activeChat.value = "";
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
        console.log("根据会话id查询的消息列表", response.data);

        store.messages = response.data.data.map((item) => {
          if (item.role === "assistant") {
            return {
              type: item.role,
              content: marked(item.content),
            };
          } else {
            if (item.content_type === "text") {
              return {
                type: item.role,
                content: item.content,
              };
            } else if (item.content_type === "object_string") {
              const content = JSON.parse(item.content);
              console.log(
                "🚀 ~ store.messages=response.data.data.map ~ content:",
                content
              );
              const files = content.filter((item) => item.type !== "text");
              console.log("🚀 ~ files ~ files:", files);
              const file = files.map((item) => {
                item.size = formatFileSize(item.size);
                return item;
              });
              return {
                type: item.role,
                content: content[0].text,
                files: file,
              };
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
      handleToggleCollapse,
      Plus,
      ArrowLeft,
      ArrowRight,
      ChatSquare,
      Setting,
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
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
}

.chat-aside.is-collapsed {
  width: 64px;
}

/* 修改收缩按钮样式和位置 */
.collapse-button {
  /* position: absolute; */
  right: 10px;
  top: 10px;
  width: 32px;
  height: 32px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 20%;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.collapse-button:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
}

.collapse-button .el-icon {
  font-size: 18px;
  color: #6b7280;
}

/* 收缩时的图标样式 */
.collapsed-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px; /* 增加顶部间距，为收缩按钮留出空间 */
  gap: 20px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.icon-btn:hover {
  transform: scale(1.05);
}

/* 展开时的侧边栏样式
.chat-aside-header {
  /* align-items: left;  
} */

.chat-aside-history {
  height: 75%;
  background-color: aliceblue;
}

.chat-aside-foot {
  height: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.new-chat-btn {
  margin: 0 5px 20px;
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

.chat-aside-headertop {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>