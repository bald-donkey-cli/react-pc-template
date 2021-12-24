import axios, { AxiosRequestConfig } from 'axios'
// import { message } from 'antd';
import { Method } from '@testing-library/dom';
import '../utils/Loading/loading.css';
import { showLoading, hideLoading } from '../utils/Loading';
import { TIMEOUT } from './config';

const message = (text: string) => alert(text)

// 定义接口
interface PendingType {
  url?: string,
  method?: Method,
  params: any,
  data: any,
  cancel: Function
}

const pending: Array<PendingType> = [];
const CancelToken = axios.CancelToken;

axios.defaults.withCredentials = true;
// axios 实例
const instance: any = axios.create({
  timeout: TIMEOUT,
  responseType: 'json',
  withCredentials: true,
});

// 配置请求头
instance.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";

/**移除重复请求*/
const removePending = (config: AxiosRequestConfig) => {
  for (const key in pending) {
    const item: number = +key;
    const list: PendingType = pending[key];

    // 当前请求在数组中存在时，执行函数体
    if (list.url === config.url && list.method === config.method && JSON.stringify(list.params) === JSON.stringify(config.params) && JSON.stringify(list.data) === JSON.stringify(config.data)) {
      // 执行取消操作
      list.cancel('操作太频繁，请稍后再试!');
      // 从数组中移除记录
      pending.splice(item, 1);
    }
  }
}

//添加请求拦截器
instance.interceptors.request.use(
  (request: any) => {

    removePending(request);
    request.cancelToken = new CancelToken((c) => {
      pending.push({ url: request.url, method: request.method, params: request.params, data: request.data, cancel: c });
    })

    // 添加某些请求不想添加请求动画
    let req = request.params || request.data
    let notAnimation = req?.notAnimation || false;
    if (!notAnimation) showLoading();//显示加载动画
    // let fixHeader = req?.header || false;

    // if (fixHeader) {
    //   console.log("1231", fixHeader);
    //   request.headers = Object.assign(request.headers, {
    //     "Content-type": "application/octet-stream"
    //   })
    //   // request.headers = {
    //   //   "Content-type": "application/octet-stream"
    //   // }
    // }
    const { url } = request;

    //当url不是/login 或 不是/register请求路由时(这两个路由不需要token)， 请求头添加token    
    if (!url.startsWith('/login') || !url.startsWith('/register')) {
      //当url以/user开头的时候，
      // request.headers.Authorization = localStorage.getItem('token');
    }

    return request
  }, (error: any) => {

    hideLoading();//关闭加载动画
    return Promise.reject(error);
  })

// 响应拦截器
instance.interceptors.response.use((response: any) => {
  removePending(response.config);

  // console.log(response);
  const code = response?.data?.code; //这里的response数据结构不一样，直接打印出来看，参照后端返回的结果
  hideLoading();//关闭加载动画
  switch (code) {
    case 400:
      // 根据code， 对业务做异常处理(和后端约定)
      // message.error({
      //   content: response?.data?.msg,
      //   duration: 2
      // })
      break;

    // case 10013:

    case -1:
      // message.error({
      //   content: response?.data?.msg
      //   //  + ', 即将自动跳转至上传页'
      //   ,
      //   duration: 2
      // })
      message(response?.data?.msg)

      break;

    case 507:
      // message.success({
      //   content: response?.data?.msg,
      //   duration: 2
      // })
      message(response?.data?.msg)
      break

    default:
      break
  }

  return response
}, (error: any) => {
  hideLoading();//关闭加载动画
  const response = error.response;

  // 根据返回的http状态码做不同的处理
  switch (response?.status) {
    case 401:
      // token失效
      // message.error({
      //   content: '您的登录已经失效，请重新登录',
      //   duration: 2
      // });
      message('您的登录已经失效，请重新登录!')
      // setTimeout(() => {
      //   localStorage.removeItem('token');
      //   //当token超时or失效 403账号无权限的时候直接跳转到/login页重新登录
      //   window.location.href = '/login'
      // }, 1000)
      break;

    case 403:// 没有权限
      // message.error({
      //   content: response?.statusText,
      //   duration: 2
      // })
      message(response?.statusText);
      break;

    case 404: // 请求路径错误
      // message.error({
      //   content: response?.statusText,
      //   duration: 2
      // })
      message(response?.statusText)
      break;

    case 500:
      // 服务器错误
      // message.error({
      //   content: '服务器异常，请稍后重试',
      //   duration: 2
      // });
      message('服务器异常，请稍后重试')
      break;

    case 504:
      // 服务器错误
      // message.error({
      //   content: '服务器异常，请稍后重试',
      //   duration: 2
      // });
      message('服务器异常，请稍后重试')
      break;

    default:
      break;
  }

  // 超时重新请求
  const config = error.config;
  // 全局的请求次数，请求的间隙
  const [RETRY_COUNT, RETRY_DELAY] = [3, 1000]

  if (config && RETRY_COUNT) {
    // 设置用于跟踪重试技术的变量
    config.__retryCount = config.__retryCount || 0;
    // 检查是否已经把重试次数用完
    if (config.__retryCount >= RETRY_COUNT) {
      return Promise.reject(response || { message: error.message })
    }
    // 增加重试次数
    config.__retryCount++;
    //  创造新的Promise来处理指数后退
    const backOff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(response)
      }, RETRY_DELAY || 1);
    });

    return backOff.then(() => instance(config));
  }

  return Promise.reject(response || { message: error.response });
})

interface config {
  responseType?: string
}

const request = {
  /**
   * @url 必传参数 请求地址 
   * @data  可传参数 请求参数，可通过添加notAnimation(true为不显示)控制是否显示请求加载动画
   * @config 可传参数 请求配置
   * */
  post(url: string, data?: object, config?: config) {
    if (config) {
      return instance({
        method: "post",
        url,
        data,
        responseType: config.responseType
      }).then((response: any) => {
        return {
          data: response?.data,
          status: response?.status,
          statusText: response?.statusText
        }
      })
    } else {
      return instance({
        method: "post",
        url,
        data
      }).then((response: any) => {
        return {
          data: response?.data,
          status: response?.status,
          statusText: response?.statusText
        }
      })
    }
  },
  /**
  * @url 必传参数 请求地址 
  * @params  可传参数 请求参数，可通过添加notAnimation(true为不显示)控制是否显示请求加载动画
  * @config 可传参数 请求配置
  * */
  get(url: string, params: object, type?: any) {
    if (type) {
      return instance({
        method: "get",
        url,
        params,
        responseType: type.responseType
      }).then((response: any) => {
        return {
          data: response?.data,
          status: response?.status,
          statusText: response?.statusText
        }
      })
    } else {
      return instance({
        method: "get",
        url,
        params
      }).then((response: any) => {
        return {
          data: response?.data,
          status: response?.status,
          statusText: response?.statusText
        }
      })
    }
  }
};

export default request;
// export default instance;

