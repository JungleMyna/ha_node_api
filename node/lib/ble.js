const path = require('path')
const fetch = require('node-fetch')
const { PythonShell } = require('python-shell')

// 蓝牙检测
class DeviceTracker {

    constructor({ api, device, mac }) {
        this.api = api
        this.device = device
        this.mac = mac
        api.log('设备：', device, '，MAC地址：', mac)
        this.update()
    }

    set_state(state) {
        this.api.set_state(this.device, state).then(() => {
            console.log(new Date().toLocaleString(), this.device, state)
        })
    }

    update() {
        let { api } = this
        PythonShell.run(path.resolve(__dirname, 'ble.py'), { args: [this.mac] }, (err, results) => {
            let time = 5000
            if (!err) {
                try {
                    let obj = JSON.parse(results[0])
                    // console.log(obj)
                    if (obj.name) {
                        // 设置在家
                        this.set_state('home')
                        this.count = 0
                        // 20秒检测
                        time = 20000
                    } else {
                        // 如果超过十次没有找到设备，则判断不在家
                        if (this.count > 10) {
                            // 设置不在家
                            this.set_state('not_home')
                            this.count = 0
                        }
                        // 如果没有检测到人，则计数加1
                        this.count += 1
                    }
                } catch (ex) {
                    api.log(ex)
                }
            } else {
                console.log('出现错误：', err)
            }
            // 超时更新
            setTimeout(() => this.update(), time)
        });
    }
}

module.exports = function (api) {
    // 读取URL
    let devices = api.config.ha_ble_home
    if (!devices) return;

    let arr = []
    Object.keys(devices).forEach(k => {
        arr.push(new DeviceTracker({ api, device: k, mac: devices[k] }))
    })
}