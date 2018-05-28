import {startLocalService} from '@theatersoft/server/lib.es'
startLocalService({
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
})
