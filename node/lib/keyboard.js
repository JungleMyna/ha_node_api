const fs = require('fs')
const InputEvent = require('input-event');

module.exports = function (api) {
    let kb = api.config.keyboard
    if (!kb) return;

    let dev_arr = []
    if (typeof kb === 'string') {
        dev_arr.push(kb)
    } else if (Array.isArray(kb)) {
        dev_arr = kb
    }

    dev_arr.forEach((dev_input, index) => {
        api.log('开始监听：', dev_input)
        if (!fs.existsSync(dev_input)) return;
        const input = new InputEvent(dev_input);
        const keyboard = new InputEvent.Keyboard(input);
        //keyboard.on('keyup'   , console.log);
        //keyboard.on('keydown' , console.log);
        keyboard.on('keypress', (data) => {
            api.log(data)
            api.fire('keyboard_remote_command_received', { index, key_code: data.code });
        });
    })
}