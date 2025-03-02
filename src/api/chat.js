const token = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';
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