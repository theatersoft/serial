import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

export default class {
    start ({name, config}) {
        const
            {settings: {port, speed}, commands} = config,
            serial = new SerialCommand(port, speed, true)
                .on('open', () => {
                    console.log(name, 'Port open')
                })
                .on('error', err => {
                    console.log(name, 'error', err)
                }),
            makeCommand = (cmd, data) => () => {
                console.log(name, 'send', cmd, data)
                serial.send(data, res => {
                    console.log(name, 'response', res)
                })
            }
        for (const cmd in commands)
            this[cmd] = makeCommand(cmd, commands[cmd])
        return bus.registerObject(name, this)
    }
}
