'use strict'

const
    bus = require('@theatersoft/bus').default,
    service = {
        module: '@theatersoft/serial',
        export: 'Evolution',
        name: 'Hvac',
        config: {port: '/dev/evolution', speed: '9600'}
    }

bus.start().then(() =>
    new (require(service.module)[service.export])().start(service))
