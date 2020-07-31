import os, time, re, uuid, logging, json, datetime, threading, ctypes, inspect, socket
from homeassistant.helpers.event import track_time_interval, async_call_later
from homeassistant.components.http import HomeAssistantView

# 获取IP
def get_ip():
    return socket.gethostbyname(socket.gethostname())

_LOGGER = logging.getLogger(__name__)

DOMAIN = 'ha_node_api'
VERSION = '1.0'
URL = '/' + DOMAIN
# 定时器时间
TIME_BETWEEN_UPDATES = datetime.timedelta(seconds=60)

def setup(hass, config):
    cfg = config[DOMAIN]
    hass.data[DOMAIN] = cfg.get('key', '1234567890')
    # 注册API接口
    hass.http.register_view(HassGateView)
              
    _LOGGER.info('''
-------------------------------------------------------------------

    外部接口【作者QQ：635147515】
    版本：''' + VERSION + '''
    API地址：''' + 'http://' + get_ip() + ':8123' + URL + '''
    项目地址：https://github.com/shaonianzhentan/ha_node_api
    
-------------------------------------------------------------------''')
    return True

class HassGateView(HomeAssistantView):

    url = URL
    name = DOMAIN
    requires_auth = False
    
    async def post(self, request):
        hass = request.app["hass"]
        key = hass.data[DOMAIN]
        res = await request.json()
        if res.get('key') == key:
            _type = res.get('type')
            if _type == 'set_state':
                # 设置状态
                entity_id = res['entity_id']
                state = res['state']
                entity = hass.states.get(entity_id)
                if entity is not None:
                    hass.states.async_set(entity_id, state, attributes=entity.attributes)
                    return self.json({'code':0, 'msg': '【' + entity.attributes['friendly_name'] + '】状态设置成功'})
            elif _type == 'fire_event':
                event_type = res.get('event_type')
                event_data = res.get('event_data', {})
                hass.bus.fire(event_type, event_data)
                return self.json({'code':0, 'msg': '事件触发成功'})

        return self.json({'code':1, 'msg': '密钥不匹配'})