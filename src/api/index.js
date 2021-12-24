import axios from '../service/request'

const { get, post } = axios;

const API_INTERFACE = {
  get_product: '/api/data/index.json',
  get_law_push: '/auth/api/android/law_push/init'
}

export const getProduct = () => get(API_INTERFACE.get_product);

export const getLawPush = () => post(API_INTERFACE.get_law_push, {
  // json: {
  "robot_id": "4ae6c1df65f25f0ec71f2684859e78f5"
  // }
}
)