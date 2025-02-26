<template>
  <el-container class="common-layout">
    <!-- 侧边栏组件 -->
    <ChatAside @chatSelected="handleChatSelected" />

    <div class="chat-container-main" v-if="isNewConversation">
      <div class="chat-header-main">
        <el-avatar
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <span class="title">我是 ChatRobot ,很高兴认识你</span>
        <p class="pa">
          我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~
        </p>
      </div>

      <div class="chat-input-container-main">
        <textarea
          v-model="userInput"
          rows="4"
          placeholder="给 ChatRobot 发送消息"
          class="chat-input-main"
          @keyup.enter="createNewChat"
        ></textarea>
        <el-button
          type="primary"
          @click="createNewChat"
          class="send-button-main"
          :icon="Promotion"
        />
      </div>
    </div>

    <!-- 输入区域 -->

    <el-container direction="vertical" v-if="!isNewConversation">
      <ChatHeader />

      <ChatMain @addMessage="handleMessage" />
    </el-container>
  </el-container>
</template>
  
  <script >
import { ref, provide } from "vue";
import ChatAside from "../components/ChatAside.vue";
import ChatHeader from "../components/ChatHeader.vue";
import ChatMain from "../components/ChatMain.vue";
import { createChat } from "../api/chat.js";
import { Promotion } from "@element-plus/icons-vue";
import { createConversation } from "../api/conversation.js";
import { useChatStore } from "../stores/chat.js";

export default {
  name: "BaseDialog",
  components: {
    ChatAside,
    ChatHeader,
    ChatMain,
  },

  setup() {
    const store = useChatStore();
    //判断当前是否是在起始页面，如果是则显示新对话页面，否则显示对话页面
    let isNewConversation = ref(true);
    //获取新创建会话的id
    const newConversationId = ref(null);
    // 用户输入的消息
    const userInput = ref("");
    //发送用户输入的消息，创建新的对话，获取机器人的回复
    let selectedChatId = ref("");
    const handleChatSelected = (chatId) => {
      console.log("Selected chat ID:", chatId);
      // 在这里处理传递过来的 chatId
      selectedChatId.value = chatId;
    };


    const handleMessage = async (userMsg) => {
      // 添加用户消息，准备接口http请求体，！！！还需要当前会话的id
      const chatData = {
        additional_messages: [
          {
            role: "uesr",
            type: "question",
            content: userMsg,
            contentType: "text",
          },
        ],
        stream: true,
        auto_save_history: true,
      };

      //将用户输入的消息添加到消息队列中
      store.$patch((state) => {
        state.messages.push({
          type: "user",
          content: userMsg,
        });
      });

      // 调用 createChat 接口，传入请求体
      createChat(chatData,selectedChatId.value).then((res) => {
        console.log(res);

        // 将机器人的回复添加到消息队列中
        store.$patch((state) => {
          state.messages.push({
            type: "assistant",
            content: res.data.data,
          });
        });
      });
    };

    // 如果是在起始页面，点击发送按钮，创建新的会话
    // 创建新的会话
    const createNewChat = async () => {
      console.log("userinput:", userInput.value);

      // 准备接口http请求体,创建会话的同时传入一条消息
      const conversationData = {
        messages: [
          {
            role: "uesr",
            type: "question",
            content: userInput.value,
            contentType: "text",
          },
        ],
      };

      // 创建新对话
      const res = await createConversation(conversationData);
      const conversationId = res.data.data.id;
      // 接收到api返回的会话id
      newConversationId.value = conversationId;
      console.log("conversationId:", newConversationId.value);

      //将新对话的状态设置为false，显示切换为聊天页面
      isNewConversation.value = false;

      //将用户输入的消息添加到消息队列中
      store.$patch((state) => {
        state.messages.push({
          type: "user",
          content: userInput.value,
        });
      });

      const firstChat = {
        stream: true,
        auto_save_history: true,
      };
      const query = conversationId;
      createChat(firstChat, query).then((res) => {
        console.log(res);

        // 将机器人的回复添加到消息队列中
        store.$patch((state) => {
          state.messages.push({
            type: "assistant",
            content: res.data.data,
          });
        });
      });
      userInput.value = "";
    };
    provide("newConversationId", newConversationId);
    provide("isNewConversation", isNewConversation);


    return {
      createNewChat,
      handleMessage,
      userInput,
      handleChatSelected,
      store,
      Promotion,
      isNewConversation,
    };
  },
};
</script>
  
  <style scoped>
.common-layout {
  height: 100%;
}

.chat-container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 85%;
}

.chat-header-main {
  text-align: center;
  margin-bottom: 200px;
}
.chat-input-container-main {
  position: absolute;
  /* top: 50%;
  left: 56%;
  transform: translate(-50%, -50%); */
  background-color: #f0f0f0; /* 灰色背景 */
  width: 600px;
  height: 100px;
  border-radius: 30px;
  padding: 10px;
}

.chat-input-main {
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
.send-button-main {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
  line-height: 1.5; /* 根据需要调整行高 */
}
</style>