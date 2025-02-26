import axios from 'axios'
import dotenv from 'dotenv';

// // 加载 .env 文件中的环境变量
// dotenv.config();
// const token = process.env.COZE_API_TOKEN || "input your coze api token"

const service = axios.create({
  baseURL: "https://api.coze.cn", // url = base url + request url
  withCredentials: false,
  timeout: 500000
})


// axios请求拦截器
service.interceptors.request.use(
  config => {
    // if(token){
    //   config.headers['token'] = token;
    // }
    return config;
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)


//axios响应拦截器
service.interceptors.response.use(res=>{
    if (res.code === 0) {// 返回登录页面
        console.log('token过期');
        return res;
      } else {
        return res;
      }
    },
    
    error => {

      if (error.response) {
        // 处理响应错误
        console.log('HTTP状态码:', error.response.status);
        console.log('响应数据:', error.response.data);
        if (error.response.status === 401) {
          console.log('用户未登录或令牌过期');
          removeToken(); // 清除本地存储的Token
          Router.replace('/login'); // 跳转到登录页面
        } else {
          // 其他HTTP错误处理
          let message = error.message;
          if (message === "Network Error") {
            message = "后端接口连接异常";
          } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
          } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
          }
          console.error(message);
        }
      } else {
        console.log('Error:', error.message);
      }
      return Promise.reject(error); // 将错误向上层抛出
    

})

export default service
