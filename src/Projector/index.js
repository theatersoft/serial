import SerialDevice from '../SerialDevice'
import {createStore} from 'redux'
import devToolsEnhancer from 'remote-redux-devtools'
import reducer from './reducer'
import bus from '@theatersoft/bus'
import {initDevice, command} from './actions'

export default class extends SerialDevice {
    start ({name, config: {settings, commands}}) {
        this.store = createStore(
            reducer,
            {},
            devToolsEnhancer({name: 'Projector', realtime: true, port: 6400})
        )
        return super.start({name, config: {settings, commands}})
            .then(() => {
                store.dispatch(initDevice({name}))
                store.subscribe(() =>
                    bus.signal(`/${name}.state`, store.getState()))
            })
    }

    dispatch (action) {
        return this[command(action)]()
            .then(() =>
                store.dispatch(action))
    }

    getState () {
        return store.getState()
    }
}
