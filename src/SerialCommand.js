import {EventEmitter} from '@theatersoft/bus'

class SerialCommand extends EventEmitter {
    constructor ({port, speed, delimiter = '\r', raw = false}) {
        super()
        this.q = []
        const SerialPort = require('serialport')
        this.serialPort = new SerialPort(port, {
            baudrate: speed,
            parser: raw ? SerialPort.parsers.raw : SerialPort.parsers.readline(delimiter)
        })
            .on('open', () => this.emit('open'))
            .on('error', err => this.emit('error', err))
            .on('data', res => {
                if (this.q.length) {
                    const cb = this.q.shift().cb
                    this.cb = cb
                    if (cb)
                        cb(res)
                    else
                        this.emit('error', new Error('Unhandled response: ' + res))
                } else if (this.cb)
                    this.cb(res)
                else
                    this.emit('error', new Error('Unexpected response: ' + res))

                if (this.q.length)
                    this.serialPort.write(this.q[0].cmd)
            })
    }

    send (cmd, cb) {
        this.q.push({cmd, cb})

        if (this.q.length === 1)
            this.serialPort.write(cmd)
    }
}

export default SerialCommand