<template>
  <el-main class="chat-main">
    <!-- 新对话界面 -->
    <div class="chat-container-welcome" v-if="isNewConversation">
      <div class="chat-header-welcome">
        <el-avatar
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <span class="title">我是 ChatRobot ,很高兴认识你</span>
        <p class="pa">
          我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~
        </p>
      </div>

      <div class="chat-input-container-welcome">
        <!-- 添加上传文件显示区域 -->
        <div class="uploaded-files" v-if="uploadedFileInfo.length > 0">
          <div
            v-for="(file, index) in uploadedFileInfo"
            :key="index"
            class="file-item"
          >
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ file.file_name || "文件" }}</span>
            <el-button
              link
              class="remove-file"
              @click="removeFile(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <textarea
          v-model="userInput"
          rows="4"
          placeholder="给 ChatRobot 发送消息"
          class="chat-input-welcome"
          @keyup.enter="createNewChat"
        ></textarea>
        <el-button type="info" class="Link-button" @click="openFileUpload">
          <el-icon><Link /></el-icon>
        </el-button>

        <el-button
          type="primary"
          @click="createNewChat"
          class="send-button-welcome"
          :icon="Promotion"
        />
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
        />
      </div>
    </div>

    <!-- 聊天记录区域 -->
    <template v-else>
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
              class="avatar"
            />
            <div class="message-container">
              <!-- 显示用户上传的文件 -->
              <div
                v-if="
                  message.type === 'user' &&
                  message.files &&
                  message.files.length > 0
                "
                class="message-files"
              >
                <div
                  v-for="(file, fileIndex) in message.files"
                  :key="fileIndex"
                  class="message-file-item"
                >
                  <el-icon><Document /></el-icon>
                  <div class="file-info">
                    <div class="file-name">{{ file.name || "文件" }}</div>
                    <div class="file-size" v-if="file.size">
                      {{ file.size }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="content" v-html="message.content"></div>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <!-- 输入区域 -->
      <div class="chat-input-container">
        <!-- 添加上传文件显示区域 -->
        <div class="uploaded-files" v-if="uploadedFileInfo.length > 0">
          <div
            v-for="(file, index) in uploadedFileInfo"
            :key="index"
            class="file-item"
          >
            <el-icon><Document /></el-icon>
            <div class="file-info">
              <div class="file-name">{{ file.name || "文件" }}</div>
              <div class="file-size">
                {{ file.size }}
              </div>
            </div>
            <el-button
              link
              class="remove-file"
              @click="removeFile(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <textarea
          v-model="userInput"
          rows="4"
          placeholder="给 ChatRobot 发送消息"
          class="chat-input"
          @keyup.enter="sendMessage"
        ></textarea>
        <el-button type="info" class="Link-button" @click="openFileUpload">
          <el-icon><Link /></el-icon>
        </el-button>

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
        />

        <el-button
          type="primary"
          @click="sendMessage"
          class="send-button"
          :icon="Promotion"
        />
        <!-- <el-button
          type="danger"
          @click="endMessage"
          class="send-button"
        >
        <el-icon><CloseBold /></el-icon>
        </el-button> -->
      </div>

      <span class="notice">内容由AI生成，请仔细甄别</span>
    </template>
  </el-main>
</template>

<script>
import { ref, watch, nextTick, inject } from "vue";
import {
  UserFilled,
  Service,
  Link,
  Document,
  Close,
  CloseBold,
} from "@element-plus/icons-vue";
import { Promotion } from "@element-plus/icons-vue";
import { useChatStore } from "../stores/chat.js";
import { uploadFile } from "../api/upload.js";
import { ElMessage } from "element-plus";

export default {
  name: "ChatMain",
  setup(props, { emit }) {
    const store = useChatStore();
    const userInput = ref("");
    const scrollbarRef = ref(null);
    const isNewConversation = inject("isNewConversation", ref(true));
    const fileInput = ref(null);
    const uploadedFileInfo = ref([]);

    const sendMessage = async () => {
      if (!userInput.value.trim() && uploadedFileInfo.value.length === 0)
        return;

      const message = userInput.value;
      const fileInfo = uploadedFileInfo.value;
      console.log("fileInfo:", fileInfo);
      if (isNewConversation.value) {
        emit("createNewChat", message, fileInfo);
      } else {
        emit("addMessage", message, fileInfo);
      }

      // 重置状态
      userInput.value = "";
      uploadedFileInfo.value = [];
    };

    const createNewChat = async () => {
      if (!userInput.value.trim() && !uploadedFileInfo.value) return;

      emit("createNewChat", userInput.value, uploadedFileInfo.value);

      // 重置状态
      userInput.value = "";
      uploadedFileInfo.value = [];
    };

    const openFileUpload = () => {
      fileInput.value.click();
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      console.log("🚀 ~ handleFileUpload ~ file:", file);

      if (!file) return;

      try {
        ElMessage.info("正在上传文件，请稍候...");
        // 文件大小限制为512MB
        const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB in bytes
        if (file.size > MAX_FILE_SIZE) {
          ElMessage.error("允许上传的最大文件大小为 512 MB!");
          return;
        }
        const response = await uploadFile(file);

        if (response && response.data && response.data.id) {
          uploadedFileInfo.value.push({
            type: "file",
            file_id: response.data.id,
            name: file.name,
            size: formatFileSize(file.size),
            file_type: file.type,
          });
          console.log("uploadedFileInfo:", uploadedFileInfo.value);
          ElMessage.success("文件上传成功，请点击发送按钮发送消息");
        } else {
          ElMessage.error("文件上传失败");
        }
      } catch (error) {
        console.error("文件上传错误:", error);
        ElMessage.error("文件上传失败: " + error.message);
      }

      // 清空文件输入，以便可以再次选择同一文件
      event.target.value = "";
    };

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // 移除已上传的文件
    const removeFile = (index) => {
      uploadedFileInfo.value.splice(index, 1);
    };

    // 监听 store.messages 的变化，并在变化后滚动到底部
    watch(
      () => store.messages,
      () => {
        nextTick(() => {
          if (scrollbarRef.value) {
            // scrollbarRef.value.setScrollTop(scrollbarRef.value.$el.scrollHeight);
            scrollbarRef.value.setScrollTop(9999999);
          }
        });
      },
      { deep: true }
    );

    return {
      store,
      userInput,
      scrollbarRef,
      fileInput,
      uploadedFileInfo,
      sendMessage,
      createNewChat,
      openFileUpload,
      handleFileUpload,
      isNewConversation,
      UserFilled,
      Service,
      Promotion,
      Link,
      removeFile,
      Document,
      Close,
    };
  },
};
</script>

<style>
/* 全局样式，确保代码块样式能够正确应用 */
.code-block-container {
  margin: var(--code-block-margin, 1rem 0);
  border-radius: var(--border-radius, 8px);
  overflow: hidden;
  background-color: var(--code-bg-color, #1e1e1e);
  box-shadow: var(--code-shadow, 0 4px 12px rgba(0, 0, 0, 0.25));
  transition: box-shadow 0.3s ease;
}

.code-block-container:hover {
  box-shadow: var(--code-hover-shadow, 0 6px 16px rgba(0, 0, 0, 0.3));
}
.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  color: #e0e0e0;
}
.code-language {
  font-size: 0.85rem;
  font-weight: 500;
}
.copy-button {
  background-color: var(--button-bg, transparent);
  border: 1px solid var(--button-border, #6e6e6e);
  border-radius: var(--button-radius, 4px);
  color: var(--button-text, #e0e0e0);
  padding: 6px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.copy-button:hover {
  background-color: var(--button-hover-bg, rgba(255, 255, 255, 0.1));
  border-color: var(--button-hover-border, #909090);

  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.copy-button:hover {
  background-color: #3a3a3a;
  border-color: #8e8e8e;
}
.code-block-container pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background-color: transparent !important;
}
.code-block-container code.hljs {
  background-color: transparent !important;
  padding: 0;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 确保highlight.js的样式能够正确应用 */
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0;
  background: transparent !important;
}
</style>

<style scoped>
.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

/* 新对话界面样式 */
.chat-container-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.chat-header-welcome {
  text-align: center;
  margin-bottom: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px;
  line-height: 1.5;
}

.pa {
  font-size: 16px;
  color: #666;
  margin: 10px 0;
  line-height: 1.6;
}

.chat-input-container-welcome {
  position: absolute;
  background-color: #f0f0f0;
  width: 600px;
  min-height: 100px;
  border-radius: 30px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-input-welcome {
  width: 100%;
  height: 80px;
  background-color: #f0f0f0;
  border: none;
  padding: 0px 10px 0px 10px;
  box-sizing: border-box;
  resize: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
}

.chat-input-welcome::placeholder {
  font-size: 16px;
  color: #999;
}

.send-button-welcome {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

/* 聊天记录区域样式 */
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
  align-items: flex-start;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-container {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message.user .message-container {
  align-items: flex-end;
}

.message.assistant .message-container {
  align-items: flex-start;
}

.message-files {
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-bottom: 8px;
  width: 100%;
}

.message-file-item {
  display: flex;
  align-items: center;
  background-color: #dbe4e9;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  max-width: 250px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s;
}

.message-file-item:hover {
  background-color: #cfdbe2;
}

.file-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  overflow: hidden;
}

.file-size {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.message.user .message-file-item {
  margin-left: auto; /* 用户上传的文件靠右显示 */
  background-color: #e3f0ff;
}

.message.user .message-file-item:hover {
  background-color: #d4e5fa;
}

.message.assistant .message-file-item {
  margin-right: auto; /* 助手的文件靠左显示 */
}

.message .content {
  padding: 0 10px 0 10px;
  border-radius: 10px;
  background-color: white;
  margin: 5px 10px;
}

.message.user .content {
  background-color: aliceblue;
  text-align: right; /* 用户消息水平居右 */
  vertical-align: center;
  line-height: 40px;
  height: auto; /* 修改为自适应高度 */
  min-height: 40px; /* 设置最小高度 */
}

.message.assistant .content {
  text-align: left; /* 助手消息水平居左 */
  min-height: 40px; /* 设置最小高度 */
}

/* 确保助手消息中的代码块正确显示 */
.message.assistant .content :deep(.code-block-container) {
  text-align: left;
}

.notice {
  font-size: small;
  margin-top: 20px;
}

.chat-input-container {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f0f0f0;
  width: 50%;
  border-radius: 30px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.chat-input {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  box-sizing: border-box;
  resize: none;
  outline: none;
  font-size: 18px;
}

.chat-input::placeholder {
  font-size: 18px; /* 设置提示消息字体大小 */
  color: #888;
}

.send-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.Link-button {
  position: absolute;
  bottom: 10px;
  right: 60px;
}
.avatar {
  margin-top: 8px;
}

/* 上传文件显示区域样式 */
.uploaded-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  padding: 0 10px;
}

.file-item {
  display: flex;
  align-items: center;
  background-color: #dbe4e9;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  max-width: 200px;
}

.file-name {
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  padding: 2px;
  margin-left: auto;
}
</style>