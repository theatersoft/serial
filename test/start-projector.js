'use strict'

const
    bus = require('@theatersoft/bus').default,
    options = {
        module: '@theatersoft/serial',
        export: 'SerialDevice',
        name: 'Projector',
        config: {
            settings: {
                port: '/dev/ttyUSB0',
                speed: 9600
            },
            commands: {
                "on": "* 0 IR 001\r",
                "off": "* 0 IR 002\r",
                "model": "* 0 IR 035\r",
                "name": "* 0 IR 037\r",
                "lamp": "* 0 Lamp ?\r",
                "hours": "* 0 Lamp\r"
            }
        }
    },
    service = require(options.module)[options.export]

bus.start().then(() => new service().start(options))
