const token = 'pat_3Ziad7knVDa21JvNp19HdRM7MGHmhQUbExb5zIxBgeGNQTtKDPEd7lm5v91LUs9e';
const botId = '7474133536057212968';

// 修改 createChat 函数，用 fetch 替换原先的 request
export function createChat(data, query) {
    let url = 'https://api.coze.cn/v3/chat';
    if (query) {
        url += `?conversation_id=${query}`;
    }

    console.log("createchatUrl", url);

    const fixedData = {
        bot_id: botId,
        user_id: 'lmz'
    };

    const requestData = {
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response;
    })
    .catch(error => {
        console.error('Fetch error:', error);
        throw error;
    });
}