import request from '../utils/request';

// Import token using the environment variable
const token = 'pat_3Ziad7knVDa21JvNp19HdRM7MGHmhQUbExb5zIxBgeGNQTtKDPEd7lm5v91LUs9e';


export function createConversation(data) {
    return request({
        url: '/v1/conversation/create',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 示例：添加授权头
        },
        data: data // 请求体
    });
}