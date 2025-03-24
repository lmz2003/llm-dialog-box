import request from '../utils/request';


const token = 'pat_3Ziad7knVDa21JvNp19HdRM7MGHmhQUbExb5zIxBgeGNQTtKDPEd7lm5v91LUs9e';
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