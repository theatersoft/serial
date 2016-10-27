import serialPort from 'serialport'
import {EventEmitter} from '@theatersoft/bus'

class SerialCommand extends EventEmitter {
    constructor (port, speed, raw) {
        super()
        this.q = []
        this.term = raw ? '' : '\r\n'
        this.serialPort = new serialPort.SerialPort(port, {
            baudrate: speed,
            parser: raw ? serialPort.parsers.raw : serialPort.parsers.readline(this.term)
        })
            .on('open', function () {this.emit('open')}.bind(this))
            .on('error', function (err) {this.emit('error', err)}.bind(this))
            .on('data', function (res) {
                if (this.q.length) {
                    var cb = this.q.shift().cb
                    if (cb)
                        cb(res)
                    else
                        this.emit('error', new Error('Unhandled response: ' + res))
                } else
                    this.emit('error', new Error('Unexpected response: ' + res))

                if (this.q.length)
                    this.serialPort.write(this.q[0].cmd + this.term)
            }.bind(this))
    }

    send (command, cb) {
        this.q.push({cmd: command, cb: cb})

        if (this.q.length === 1)
            this.serialPort.write(command + this.term)
    }
}

export default SerialCommand