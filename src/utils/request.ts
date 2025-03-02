import axios, { type AxiosInstance, AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
// // 加载 .env 文件中的环境变量
// dotenv.config();
// const token: string = process.env.COZE_API_TOKEN || "input your coze api token";

// 创建自定义响应数据接口
interface ApiResponse<T = any> {
  code?: number;
  data?: T;
  message?: string;
  [key: string]: any;
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: "https://api.coze.cn", // url = base url + request url
  withCredentials: false,
  timeout: 500000
});

// 移除 token 的函数类型声明
const removeToken = (): void => {
  // 实现逻辑，比如从 localStorage 中删除 token
  localStorage.removeItem('token');
};

// axios 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // if(token){
    //   config.headers = config.headers || {};
    //   config.headers['token'] = token;
    // }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.log(error);
    return Promise.reject(error);
  }
);

// axios 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> | Promise<AxiosResponse<ApiResponse>> => {
    const res = response.data;
    if (res.code === 0) {
      // 返回登录页面
      console.log('token过期');
      return Promise.resolve(response);
    } else {
      return response;
    }
  },
  (error: AxiosError): Promise<AxiosError> => {
    if (error.response) {
      // 处理响应错误
      console.log('HTTP状态码:', error.response.status);
      console.log('响应数据:', error.response.data);
      if (error.response.status === 401) {
        console.log('用户未登录或令牌过期');
        removeToken(); // 清除本地存储的Token
        // 由于 Router 未导入，这里注释掉，实际使用时应该导入 Router 并取消注释
        // Router.replace('/login'); // 跳转到登录页面
      } else {
        // 其他HTTP错误处理
        let message: string = error.message;
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
  }
);

export default service;