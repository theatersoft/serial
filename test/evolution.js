'use strict'

const
    bus = require('@theatersoft/bus').default,
    options = {
        module: '@theatersoft/serial',
        export: 'Evolution',
        name: 'Hvac',
        config: {
            settings: {
                port: '/dev/evolution',
                speed: 9600,
                delimiter: '\r\n'
            }
        }
    },
    service = require(options.module)[options.export]

bus.start().then(() =>
    new service().start(options))
