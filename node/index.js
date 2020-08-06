const API = require('./lib/api')
const api = new API()
// 初始化蓝牙检测
const ble = require('./lib/ble')
ble(api)
// 检测键盘
const keyboard = require('./lib/keyboard')
keyboard(api)
// 喜马拉雅VIP解析服务
const ximalaya = require('./lib/ximalaya')
ximalaya(api)