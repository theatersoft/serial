import SerialDevice from '../SerialDevice'
import {createStore} from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import reducer from './reducer'
import bus from '@theatersoft/bus'
import {initDevice, command} from './actions'
import {Type} from '@theatersoft/device'

export default class extends SerialDevice {
    start ({name, config: {settings, commands, remotedev}}) {
        this.name = name
        this.store = createStore(
            reducer,
            {},
            remotedev && devToolsEnhancer({name, realtime: true, port: 6400, hostname: remotedev})
        )
        return super.start({name, config: {settings, commands}})
            .then(obj => {
                this.store.dispatch(initDevice({name, value: undefined, type: Type.Projector}))
                this.store.subscribe(() =>
                    obj.signal('state', this.store.getState()))
                const register = () => bus.proxy('Device').registerService(this.name)
                bus.registerListener(`Device.start`, register)
                bus.on('reconnect', register)
                register()
            })
    }

    dispatch (action) {
        return !throttle() && this[command(action)]()
                .then(() =>
                    this.store.dispatch(action))
    }

    getState () {
        return this.store.getState()
    }
}

let last = 0
const delay = 60000,
    throttle = () => {
        const
            now = Date.now(),
            ret = (now - last) < delay
        if (!ret) last = now
        return ret
    }