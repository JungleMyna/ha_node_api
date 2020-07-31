const fetch = require('node-fetch')

module.exports = class {
    constructor(config) {
        this.config = config
        this.http = (params) => {
            return fetch(config.url, {
                method: 'POST',
                body: JSON.stringify({
                    key: config.key,
                    ...params
                })
            })
        }
    }

    set_state(entity_id, state) {
        return this.http({ type: 'set_state', entity_id, state })
    }

    fire(event_type, event_data) {
        return this.http({ type: 'fire_event', event_type, event_data })
    }
}