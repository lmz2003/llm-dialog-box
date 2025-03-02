import { CozeAPI, COZE_CN_BASE_URL, ChatStatus, RoleType ,  ChatEventType,   type CreateChatData,} from '@coze/api';
import assert from 'assert';
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();


// Import token using the environment variable
const token = process.env.COZE_API_TOKEN || "input your coze api token"
const botId = process.env.COZE_BOT_ID || "input your coze bot id"
// Instantiate Coze API client
const client = new CozeAPI({
  baseURL: COZE_CN_BASE_URL,
  token: token,
});


const query = 'give me a joke';

async function streamingChat(callback?: (v: CreateChatData) => void,query?:string) {
  assert(botId, 'botId is required');
  const v = await client.chat.stream({
    bot_id: botId,
    auto_save_history: false,
    additional_messages: [
      {
        role: RoleType.User,
        content: query,
        content_type: 'text',
      },
    ],
  });

  for await (const part of v) {
    if (part.event === ChatEventType.CONVERSATION_CHAT_CREATED) {
      console.log('[START]');
      callback && callback(part.data);
    } else if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      process.stdout.write(part.data.content);
    } else if (part.event === ChatEventType.CONVERSATION_MESSAGE_COMPLETED) {
      const { role, type, content } = part.data;
      if (role === 'assistant' && type === 'answer') {
        process.stdout.write('\n');
      } else {
        console.log('[%s]:[%s]:%s', role, type, content);
      }
    } else if (part.event === ChatEventType.CONVERSATION_CHAT_COMPLETED) {
      console.log(part.data.usage);
    } else if (part.event === ChatEventType.DONE) {
      console.log(part.data);
    } else if (part.event === ChatEventType.ERROR) {
      console.error(part.data);
    }
  }

  console.log('=== End of Streaming Chat ===');
}

// async function nonStreamingChat() {
//   assert(botId, 'botId is required');

//   const v = await client.chat.createAndPoll({
//     bot_id: botId,
//     additional_messages: [
//       {
//         role: RoleType.User,
//         content: query,
//         content_type: 'text',
//       },
//     ],
//   });
//   if (v.chat.status === ChatStatus.COMPLETED) {
//     for (const item of v.messages || []) {
//       console.log('[%s]:[%s]:%s', item.role, item.type, item.content);
//     }
//     console.log('usage', v.chat.usage);
//   }
// }



// TODO  test
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function submitToolOutputs() {
  const v = await client.chat.submitToolOutputs({
    conversation_id: '123',
    chat_id: '123',
    tool_outputs: [{ tool_call_id: '123', output: '123' }],
    stream: false,
  });
  console.log('client.chat.submitToolOutputs', v);
}


async function sleep(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function streamingCancel() {
  streamingChat(async v => {
    sleep(2000);
    const result = await client.chat.cancel(v.conversation_id, v.id);
    console.log('client.chat.cancel', result);
  });
}

// async function main() {
//   await streamingChat();
//   streamingCancel();
// }

// main().catch(console.error);

export { streamingChat, streamingCancel };