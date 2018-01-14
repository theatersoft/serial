import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

export default class {
    start ({name, config: {settings, commands}}) {
        const makeCommand = (cmd, data) => () => {
                console.log(name, 'send', cmd, data)
                return new Promise(resolve => {
                    this.serial.send(data, res => {
                        console.log(name, 'response', res)
                        resolve(res)
                    })
                })
            }
        for (const cmd in commands)
            this[cmd] = makeCommand(cmd, commands[cmd])
        this.serial = new SerialCommand(settings)
            .on('open', () => {
                console.log(name, 'Port open')
            })
            .on('error', err => {
                console.log(name, 'error', err)
            })

        return bus.registerObject(name, this)
    }

    stop () {
        if (this.serial) {
            this.serial.close()
            delete this.serial
        }
    }
}
