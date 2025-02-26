import request from '../utils/request';
import dotenv from 'dotenv';

// Import token using the environment variable
const token = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';


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