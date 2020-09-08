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
        // 开始递归获取信息
        const getVoiceText = async () => {
            // 获取最新一条消息
            let recordsObj = null
            try {
                const { records } = await invoke({
                    url: `https://userprofile.mina.mi.com/device_profile/conversation?timestamp=${Date.now()}&limit=1`,
                    data: {},
                    cookie
                })
                recordsObj = records[0]
            } catch (ex) {
                api.log('出现异常：', ex)
                setTimeout(getVoiceText, 5000)
                return
            }

            let { timestamp, recordGroup } = recordsObj
            const data = JSON.parse(recordGroup)
            const text = data.user.content
            // api.log(`${text}【${new Date(timestamp).toLocaleString()}】`)
            // 获取当前
            let today = new Date()
            let ts = today.setSeconds(today.getSeconds() - 60)
            // 10秒之内没有数据，则5秒之后再运行
            if (ts > timestamp) {
                setTimeout(getVoiceText, 5000)
                return
            }
            // 获取当前语音状态
            api.getState('conversation.voice').then(({ attributes }) => {
                // 当时间不一致时，则触发事件
                if (attributes['timestamp'] != timestamp) {
                    api.log(`发送到HA`)
                    api.log(`${text}【${new Date(timestamp).toLocaleString()}】`)
                    // 发送命令
                    api.callService('conversation.process', {
                        text,
                        source: 'xiaomi',
                        timestamp: String(timestamp)
                    })
                }
            }).finally(() => {
                // 递归轮询消息
                setTimeout(() => {
                    getVoiceText()
                }, 1000)
            })
        }

        getVoiceText()

    })

}