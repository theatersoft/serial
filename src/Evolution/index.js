import bus from '@theatersoft/bus'
import codec from './codec'
import {createStore} from 'redux'
import reducer from './reducer'
import devToolsEnhancer from 'remote-redux-devtools'
import {SUCCESS, NAK, FAIL} from './actions'

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

const dedup = (getState, _state = getState()) => f => (_next = getState()) => {
    if (!equal(_next, _state)) {
        _state = _next
        f(_next)
    }
}

export default class {
    start ({name, config: {settings}}) {
        this.name = name
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
                device: {name, value: {}}
            },
            devToolsEnhancer({name, realtime: true, port: 6400})
        )
        return bus.registerObject(name, this)
            .then(() => {
                this.store.subscribe(dedup(select(this.store.getState))(state=>
                    bus.signal(`/${this.name}.state`, state)))
                codec({settings, store: this.store})
                const register = () => bus.proxy('Device').registerService(this.name)
                bus.registerListener(`/Device.started`, register)
                register()
            })
    }

    dispatch (action) {
        return this.store.dispatch(action)
    }

    getState () {
        return select(this.store.getState)()
    }
}
