import serialPort from 'serialport'
import {EventEmitter} from '@theatersoft/bus'

class SerialCommand extends EventEmitter {
    constructor (port, speed, raw, strict) {
        super()
        this.q = []
        this.term = raw ? '' : '\r\n'
        this.strict = strict
        this.serialPort = new serialPort.SerialPort(port, {
            baudrate: speed,
            parser: raw ? serialPort.parsers.raw : serialPort.parsers.readline(this.term)
        })
            .on('open', () => this.emit('open'))
            .on('error', err => this.emit('error', err))
            .on('data', res => {
                if (this.q.length) {
                    const cb = this.q.shift().cb
                    if (!strict) this.cb = cb
                    if (cb)
                        cb(res)
                    else
                        this.emit('error', new Error('Unhandled response: ' + res))
                } else if (this.cb)
                    this.cb(res)
                else
                    this.emit('error', new Error('Unexpected response: ' + res))

                if (this.q.length)
                    this.serialPort.write(this.q[0].cmd + this.term)
            })
    }

    send (cmd, cb) {
        this.q.push({cmd, cb})

        if (this.q.length === 1)
            this.serialPort.write(cmd + this.term)
    }
}

export default SerialCommand