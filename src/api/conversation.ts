import request from '../utils/request.js';

// Import token using the environment variable
const token: string = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';

// 定义请求数据的接口
interface ConversationRequestData {
  messages?: Array<{
    role: string;
    type: string;
    content: string;
    contentType: string;
  }>;
  [key: string]: any; // 允许其他属性
}

// 定义响应数据的接口
interface ConversationResponse {
  data: {
    id: string;
    [key: string]: any;
  };
  code: number;
  message: string;
}

/**
 * 创建对话
 * @param data - 创建对话的请求数据
 * @returns Promise 包含响应结果
 */
export function createConversation(data: ConversationRequestData): Promise<ConversationResponse> {
  return request({
    url: '/v1/conversation/create',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    data: data // 请求体
  });
}