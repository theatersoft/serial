import SerialDevice from '../SerialDevice'
import Store from './Store'
import bus, {EventEmitter} from '@theatersoft/bus'
import {command} from './actions'

export default class extends SerialDevice {
    start ({name, config: {settings, commands}}) {
        return super.start({name, config: {settings, commands}})
            .then(() => {
                this.store = new Store()
                    .on('change', state =>
                        bus.signal(`/${name}.change`, state))
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
