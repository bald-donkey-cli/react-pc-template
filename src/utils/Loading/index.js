
import ReactDOM from 'react-dom';
// import { Spin } from 'antd';

/** 显示加载动画*/
export function showLoading () {
  let dom = document.createElement('div')
  dom.setAttribute('id', 'loading')
  document.body.appendChild(dom)
  ReactDOM.render(<span>加载中</span>, dom)
}

/** 隐藏加载动画*/
export function hideLoading () {
  try {
    document.body.removeChild(document.getElementById('loading'))
  } catch { }
}