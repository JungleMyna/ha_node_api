const fs = require('fs')
const YAML = require('yaml')
const API = require('./lib/api')
// 读取配置
const file = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(file)
const api = new API(config)
// 初始化蓝牙检测
const ble = require('./lib/ble')
ble(api)
// 检测键盘
const keyboard = require('./lib/keyboard')
keyboard(api)
