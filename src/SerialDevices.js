import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

var
    //config = require('./Config'),
    devices = {},
     makeDevice = function (name, serialCommand, commands) {
        var
            device = {},
            makeCommand = function (cmd, data) {
                return function() {
                    console.log(name, 'send', cmd, data)
//            for (var i =0; i < data.length; i++) console.log(i, data.charCodeAt(i))
                    serialCommand.send(data, function (res) {
                        console.log(name, 'response', res)
                    })
                }
            }
        for (var cmd in commands)
            device[cmd] = makeCommand(cmd, commands[cmd])
        return device
    },
    name, device

export default class {
    start ({name, config}) {
        if (config.host.SerialDevices)
            for (name in config.host.SerialDevices) {
                device = config.host.SerialDevices[name]
                devices[name] = makeDevice(
                    name,
                    new SerialCommand(device.settings.port, device.settings.speed, true)
                        .on('open',function () {
                            console.log(name, 'Port open')
                        })
                        .on('error', function (err) {
                            console.log(name, 'error', err)
                        }),
                    device.commands
                )
            }
    }
}