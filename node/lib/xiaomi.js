const XiaoAi = require('xiaoai-tts')
const invoke = require('xiaoai-tts/src/lib/invoke')
const fs = require('fs')
let client = null;

module.exports = async function (api) {
    let cfg = api.config.xiaomi
    if (!cfg) return;
    let sessionFile = 'session.json'
    try {
        // 尝试读取本地 Session 信息
        const cookie = JSON.parse(fs.readFileSync(sessionFile, { encoding: 'utf8' }))
        // 通过 Session 登录
        client = new XiaoAi(cookie)
    } catch (e) {
        client = new XiaoAi(cfg.user, cfg.password)
        const cookie = await client.connect()
        // 将 Session 储存到本地
        fs.writeFileSync(sessionFile, JSON.stringify(cookie))
    }
    client.session.then(({ cookie }) => {

        setInterval(async () => {
            const { records } = await invoke({
                url: `https://userprofile.mina.mi.com/device_profile/conversation?timestamp=${Date.now()}&limit=1`,
                data: {},
                cookie
            })
            let { timestamp, recordGroup } = records[0]
            const data = JSON.parse(recordGroup)
            const text = data.user.content
            // api.log(`${text}【${new Date(timestamp).toLocaleString()}】`)
            // 当前时间减3秒
            let today = new Date()
            let ts = today.setSeconds(today.getSeconds() - 3)
            if (ts < timestamp) {
                api.log(`${text}【${new Date(timestamp).toLocaleString()}】`)
                api.callService('conversation.process', {
                    text, source: 'xiaomi'
                })
            }
        }, 2000);
    })

}