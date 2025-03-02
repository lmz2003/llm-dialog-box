const token: string = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';
const botId: string = '7474133536057212968';

// 定义接口类型
interface ChatRequestData {
  additional_messages?: Array<{
    role: string;
    content: string;
    content_type: string;
  }>;
  stream?: boolean;
  auto_save_history?: boolean;
  [key: string]: any; // 允许其他属性
}

interface FixedData {
  bot_id: string;
  user_id: string;
}

/**
 * 创建聊天请求
 * @param data - 聊天请求数据
 * @param query - 可选的会话ID
 * @returns Promise 包含响应结果
 */
export function createChat(data: ChatRequestData, query?: string): Promise<Response> {
  let url: string = 'https://api.coze.cn/v3/chat';
  if (query) {
    url += `?conversation_id=${query}`;
  }

  console.log("createchatUrl", url);

  const fixedData: FixedData = {
    bot_id: botId,
    user_id: 'lmz'
  };

  const requestData: ChatRequestData & FixedData = {
    ...fixedData,
    ...data
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  })
  .then((response: Response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response;
  })
  .catch((error: Error) => {
    console.error('Fetch error:', error);
    throw error;
  });
}