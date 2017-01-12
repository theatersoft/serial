import SerialDevice from '../SerialDevice'
import store from './store'
import bus from '@theatersoft/bus'
import {initDevice, command} from './actions'

export default class extends SerialDevice {
    start ({name, config: {settings, commands}}) {
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
