const fs = require('fs')
const fetch = require('node-fetch')
const YAML = require('yaml')

module.exports = class {
    constructor() {
        this.http = async (params) => {
            let res = await fetch(config.url, {
                method: 'POST',
                body: JSON.stringify({
                    key: config.key,
                    ...params
                })
            }).then(res => res.json())
            this.log(res)
            return res
        }
        this.read()
    }

    read() {
        // 读取配置
        const file = fs.readFileSync('./config.yaml', 'utf8')
        this.config = YAML.parse(file)
    }

    log() {
        console.log(new Date().toLocaleString(), ...arguments)
    }

    set_state(entity_id, state) {
        return this.http({ type: 'set_state', entity_id, state })
    }

    fire(event_type, event_data) {
        return this.http({ type: 'fire_event', event_type, event_data })
    }
}