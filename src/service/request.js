import axios from 'axios';

import { TIMEOUT } from './config';

const instance = axios.create({
  timeout: TIMEOUT
})

//添加拦截
instance.interceptors.request.use(config => {
  console.log('请求被拦截')
  return config
}, error => {

})

instance.interceptors.response.use(res => {
  console.log('响应拦截');
  return res.data
}, error => {
  return error;
})


export default instance;