import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

export default class {
    start ({name, config: {settings, commands}}) {
        const
            serial = new SerialCommand(settings)
                .on('open', () => {
                    console.log(name, 'Port open')
                })
                .on('error', err => {
                    console.log(name, 'error', err)
                }),
            makeCommand = (cmd, data) => () => {
                console.log(name, 'send', cmd, data)
                return new Promise(resolve => {
                    serial.send(data, res => {
                        console.log(name, 'response', res)
                        resolve(res)
                    })
                })
            }
        for (const cmd in commands)
            this[cmd] = makeCommand(cmd, commands[cmd])
        return bus.registerObject(name, this)
    }
}
