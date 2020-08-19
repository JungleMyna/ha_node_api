const fs = require('fs')
const YAML = require('yaml')
const HomeAssistant = require('homeassistant')

module.exports = class {
    constructor() {
        this.read()
    }

    read() {
        // 读取配置
        const file = fs.readFileSync('./config.yaml', 'utf8')
        this.config = YAML.parse(file)
        this.connect()
    }

    connect() {
        if (this.hass) return;
        let { url, token } = this.config
        let link = new URL(url)
        let host = `${link.protocol}//${link.hostname}`
        let port = link.port
        this.hass = new HomeAssistant({ host, port, token, ignoreCert: false });
        this.log(`连接成功【${url}】`)
    }

    log() {
        console.log(new Date().toLocaleString(), ...arguments)
    }

    set_state(entity_id, state) {
        let { hass } = this
        let arr = entity_id.split('.')
        hass.states.get(arr[0], arr[1]).then(res => {
            res['state'] = state
            hass.states.update(arr[0], arr[1], res);
        })
        this.log(`【${entity_id}】更新状态【${state}】`)
    }

    fire(event_type, event_data) {
        this.hass.events.fire(event_type, event_data);
        this.log(`事件名【${event_type}】事件参数【${event_data}】`)
    }
}