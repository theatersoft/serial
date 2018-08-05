import {EventEmitter} from '@theatersoft/bus'

class SerialCommand extends EventEmitter {
    constructor ({port, speed, delimiter = '\r', raw = false}) {
        super()
        this.q = []
        const
            SerialPort = require('serialport'),
            Readline = require('@serialport/parser-readline'),
            serialPort = new SerialPort(port, {baudRate: speed})
                .on('open', () => this.emit('open'))
                .on('error', err => this.emit('error', err)),
            parser = (raw ? serialPort : serialPort.pipe(new Readline({delimiter})))
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
        this.serialPort = serialPort
    }

    send (cmd, cb) {
        this.q.push({cmd, cb})

        if (this.q.length === 1)
            this.serialPort.write(cmd)
    }

    close () {
        this.serialPort.close()
    }
}

export default SerialCommand