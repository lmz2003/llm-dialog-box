import { marked } from 'marked';
import { createChat } from '../api/chat';
import { createConversation } from '../api/conversation';
import hljs from 'highlight.js';

// 配置marked渲染器，为代码块添加复制按钮和样式
const configureMarked = () => {
  const renderer = new marked.Renderer();
  
  // 保存原始的代码块渲染方法
  const originalCodeRenderer = renderer.code;
  console.log()
  // 重写代码块渲染方法
  renderer.code = function(code, language) {
    if(typeof code === 'object' && code.type === 'code'){
      language = code.lang || 'plaintext';
      code = code.text || '';
    }

    // 尝试使用highlight.js进行代码高亮
    let highlightedCode = code;

    if (language && hljs.getLanguage(language)) {
      try {

        highlightedCode = hljs.highlight(code, { language }).value;
        console.log("highlightedCode:",highlightedCode)
      } catch (e) {
        console.error('代码高亮失败:', e);
      }
    }
    
    // 使用高亮后的代码生成HTML
    const renderedCode = `<pre><code class="hljs language-${language || 'plaintext'}">${highlightedCode}</code></pre>`;
    
    // 创建包含复制按钮的代码块容器
    return `
      <div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">${language || 'code'}</span>
          <button class="copy-button" onclick="window.copyCode(this)">Copy</button>
        </div>
        ${renderedCode}
      </div>
    `;
  };
  
  // 配置marked使用自定义渲染器
  marked.setOptions({
    renderer: renderer,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (e) {
          console.error('代码高亮失败:', e);
        }
      }
      return code;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
  });
};

// 初始化marked配置
configureMarked();

export class ChatHelper {
  constructor(store) {
    this.store = store;
  }

  async handleChatMessage(message, conversationId = null, isNewConversation = false, fileInfoArray = null) {
    try {
      // 初始化变量
      let messageContent = "";
      let contentType = "text";
      let displayContent = "";
      
      // 处理消息内容
      if (fileInfoArray && fileInfoArray.length > 0) {
        console.log("🚀 ~ ChatHelper ~ handleChatMessage ~ fileInfoArray:", fileInfoArray)
        
        // 如果有文件且有文本，使用object_string类型
        if (message && message.trim()) {
          // 构建包含文本和文件的消息数组
          const messageArray = [
            { type: "text", text: message }
          ];
          
          // 添加所有文件到消息数组
          fileInfoArray.forEach(fileInfo => {
            const file = {
              type: fileInfo.type,
              file_id: fileInfo.file_id
            }
            messageArray.push(file);
          });
          
          messageContent = JSON.stringify(messageArray);
          contentType = "object_string";
          
          displayContent = message;
          
          console.log("🚀 ~ ChatHelper ~ handleChatMessage ~ displayContent:", displayContent)
        } 
        // 如果只有文件没有文本，需要添加一个空文本消息
        else {
          // 构建包含空文本和文件的消息数组
          const messageArray = [
            { type: "text", text: " " } // 添加一个空格作为文本消息
          ];
          
          // 添加所有文件到消息数组
          fileInfoArray.forEach(fileInfo => {
            const file = {
              type: fileInfo.type,
              file_id: fileInfo.file_id
            }
            messageArray.push(file);
          });
          
          messageContent = JSON.stringify(messageArray);
          contentType = "object_string";
          displayContent = '';
        }
      } 
      // 如果只有文本没有文件，直接使用text类型
      else if (message && message.trim()) {
        messageContent = message;
        contentType = "text";
        displayContent = message;
      }
      // 如果既没有文本也没有文件，返回错误
      else {
        throw new Error("消息内容不能为空");
      }

      // 如果是新对话，先创建会话
      if (isNewConversation) {
        const conversationData = {
          messages: [
            {
              role: "user",
              type: "question",
              content: messageContent,
              content_type: contentType,
            },
          ],
        };
        const res = await createConversation(conversationData);
        conversationId = res.data.data.id;
      }

      // 添加用户消息到store
      this.store.$patch((state) => {
        state.messages.push({
          type: "user",
          content: displayContent,
          files: fileInfoArray
        });
        state.messages.push({
          type: "assistant",
          content: "", // 助手消息初始为空，后续会使用 marked 处理
        });
      });

      // 准备聊天数据
      const chatData = isNewConversation 
        ? {
            stream: true,
            auto_save_history: true,
          }
        : {
            additional_messages: [
              {
                role: "user",
                type: "question",
                content: messageContent,
                content_type: contentType,
              },
            ],
            stream: true,
            auto_save_history: true,
          };

      // 发送聊天请求并处理流式响应
      const response = await createChat(chatData, conversationId);
      await this.handleStreamResponse(response);

      return conversationId;
    } catch (error) {
      console.error("聊天请求错误:", error);
      throw error;
    }
  }

  async handleStreamResponse(response) {
    const reader = response.body.getReader();
    let decoder = new TextDecoder();
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      let flag = false;

      for (const line of lines) {
        if (!line.trim()) continue;

        if (line === "event:conversation.message.delta") {
          flag = true;
          continue;
        }

        if (flag) {
          const cleanedLine = line.replace(/^data:/, "").trim();
          const jsonStr = cleanedLine.replace(/(\r\n|\n|\r)/gm, "");
          try {
            const data = JSON.parse(jsonStr);
            if (data.content_type === "text" && data.content) {
              accumulatedContent += data.content;
              this.store.$patch((state) => {
                const lastMessage = state.messages[state.messages.length - 1];
                // 对于 assistant 类型的消息，使用 marked 处理内容
                lastMessage.content = lastMessage.type === 'assistant' ? marked(accumulatedContent) : accumulatedContent;
              });
            }
          } catch (e) {
            console.error("解析消息失败:", e, "raw data:", jsonStr);
          }
          flag = false;
        }
      }
    }
  }
} 