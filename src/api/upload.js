const token = 'pat_2qM0MTy1epYIyrIXGA9lfC6tx1eMJE1U4Q9DhX0aGv0NAbhwrhh85c2DScj1kKM7';
const botId = '7474133536057212968';

/**
 * 上传文件到Coze平台
 * @param {File} file - 要上传的文件对象
 * @returns {Promise<Object>} - 包含上传结果的Promise
 */
export function uploadFile(file) {
    const url = 'https://api.coze.cn/v1/files/upload';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bot_id', botId);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    })
    .then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error('文件上传失败');
        }
        return response.json();
    })
    .then(data => {
        console.log('文件上传成功:', data);
        return data;
    })
    .catch(error => {
        console.error('文件上传错误:', error);
        throw error;
    });
} 