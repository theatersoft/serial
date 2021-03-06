import bus from '@theatersoft/bus'
import codec from './codec'
import {createStore} from 'redux'
import reducer from './reducer'
import devToolsEnhancer from 'remote-redux-devtools'
import {SUCCESS, NAK, FAIL} from './actions'
import {Type} from '@theatersoft/device'

const select = getState => () => {
    const {device} = getState()
    return {device}
}
//const equal = (a, b) => (a === b)
// selected objects require shallow comparison
const equal = (a, b, _a = Object.keys(a), _b = Object.keys(b)) => (
    _a.length === _b.length && !_a.find(k =>
        !_b.includes(k) || a[k] !== b[k]
    )
)

const dedup = (getState, _state = {}) => f => (_next = getState()) => {
    if (!equal(_next, _state)) {
        _state = _next
        f(_next)
    }
}

export default class {
    async start ({name, config: {settings, remotedev}}) {
        this.name = name
        this.obj = await bus.registerObject(name, this)
        this.store = createStore(
            reducer,
            {
                info: {
                    LastUpdate: '',
                    [SUCCESS]: 0,
                    [NAK]: 0,
                    [FAIL]: 0,
                    LastError: ''
                },
                device: {name, value: {}, type: Type.Hvac}
            },
            remotedev && devToolsEnhancer({name, realtime: true, port: 6400, hostname: remotedev})
        )
        this.store.subscribe(dedup(select(this.store.getState))(state =>
            this.obj.signal('state', state)))
        this.codec = codec({settings, store: this.store})
        const register = () => bus.proxy('Device').registerService(this.name)
        bus.registerListener(`Device.start`, register)
        bus.on('reconnect', register)
        register()
    }

    stop () {
        if (this.codec) {
            this.codec.close()
            delete this.codec
        }
        return this.obj && bus.unregisterObject(this.name)
    }

    dispatch (action) {
        return this.store.dispatch(action)
    }

    getState () {
        return select(this.store.getState)()
    }
}
