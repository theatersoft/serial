import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

const
    model = {
        LastUpdate: '',
        SuccessCount: 0,
        FailCount: 0,
        NakCount: 0,
        LastError: ''
    },
    readKeys = [
        'Z1RT', // room temperature s1z1rt:72
        'Z1RH', // room humidity s1z1rh:40%
        'Z1RHTG', // humidification target s1z1rhtg:40%
        'HUMID', // humidifier state szhumid:ON
        'OAT', // outdoor temperature 's1oat:62°F'
        'CFGEM', // units: E M
        'Z1FAN', // fan setting: auto low med high
        'MODE', // mode setting: heat cool auto off eheat
        'Z1HTSP', // heat setpoint
        'Z1CLSP' // cool setpoint
    ],
    writeKeys = [
        'Z1FAN', // fan setting: auto low med high
        'MODE', // mode setting: heat cool auto off eheat
        'Z1HTSP', // heat setpoint
        'Z1CLSP' // cool setpoint
    ],
    delim = /[%\uFFFD]/

let serialCommand, index = 0

function send () {
    const command = 'S1' + readKeys[index] + '?'
//    console.log(command)
    serialCommand.send(command, res => {
//        console.log(res)
        if (res.length > command.length
            && res.indexOf(command.slice(0, command.length - 1)) === 0
            && res[command.length - 1] === ':'
        ) {
            res = res.slice(command.length).split(delim)[0]

            if (!res.indexOf('NAK'))
                model.NakCount++
            else {
                model[readKeys[index]] = res
                index = ++index % readKeys.length
                if (!index) {
                    model.SuccessCount++
                    model.LastUpdate = new Date().toString()
                    console.log(model)
                    bus.signal('/Hvac.data', model)
                }
            }
        } else {
            model.FailCount++
            model.LastError = res
//            console.log('Fail')
        }
        send()
    })
}

export default class {
    start ({name, config}) {
        return bus.registerObject(name, this)
            .then(() => {
                serialCommand = new SerialCommand(
                    config.port,
                    config.speed
                )
                    .on('open', send)
                    .on('error', err => {
                        model.FailCount++
                        model.LastError = err
                        console.log(err)
                    })
            })
    }
}

export const rpc = {
    get () {
        return model
    }
}
