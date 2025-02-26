import request from '../utils/request';


const token = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';
const botId = '7474133536057212968'

export function queryMsgList(data,query) {

    // 构建基础 URL
    let url = '/v1/conversation/message/list';

    // 如果 query 存在，构建查询参数字符串并附加到 URL
    if (query) {
        url += `?conversation_id=${query}`;
    }
    return request({
        url: url,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 示例：添加授权头
        },
        data: data // 请求体
    });
}