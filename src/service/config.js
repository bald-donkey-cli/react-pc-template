const devBaseURL = 'http://chst.vip:8081/'; // 测试环境后端地址
const proBaseURL = 'http://chst.vip:8081/'; // 正式环境后端地址

const BASE_URL = process.env.REACT_APP_BUILD_ENV === 'development' ? devBaseURL : proBaseURL;
console.log("---", process.env.REACT_APP_BUILD_ENV);
console.log("---+", BASE_URL);

const TIMEOUT = 10000; // 配置请求时长
const TimeoutNum = 3; // 超时尝试次数
const IntervalTime = 1000; // 超时重新请求间隔
const SuccessCode = [200, '200']; // 操作正常code，支持String、Array、int多种类型
const StatusName = 'code'; // 数据状态的字段名称
const MessageName = 'msg'; // 状态信息的字段名称

module.exports = {
  BASE_URL,
  TIMEOUT,
  TimeoutNum,
  IntervalTime,
  SuccessCode,
  StatusName,
  MessageName
}