import SerialDevice from '../SerialDevice'
import {createStore} from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import reducer from './reducer'
import bus from '@theatersoft/bus'
import {initDevice, command} from './actions'

export default class extends SerialDevice {
    start ({name, config: {settings, commands, remotedev = 'localhost'}}) {
        this.store = createStore(
            reducer,
            {},
            devToolsEnhancer({name: 'Projector', realtime: true, port: 6400, hostname: remotedev})
        )
        return super.start({name, config: {settings, commands}})
            .then(() => {
                this.store.dispatch(initDevice({name}))
                this.store.subscribe(() =>
                    bus.signal(`/${name}.state`, this.store.getState()))
            })
    }

    dispatch (action) {
        return this[command(action)]()
            .then(() =>
                this.store.dispatch(action))
    }

    getState () {
        return this.store.getState()
    }
}
