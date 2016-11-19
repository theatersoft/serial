import bus from '@theatersoft/bus'
import SerialCommand from './SerialCommand'

const
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

export default class {
    start ({name, config: {settings}}) {
        let serial,
            model = {
                LastUpdate: '',
                SuccessCount: 0,
                FailCount: 0,
                NakCount: 0,
                LastError: ''
            },
            index = 0
        const send = () => {
            const
                command = `S1${readKeys[index]}?\r\n`,
                cmdlen = command.indexOf('?')
//    console.log(command)
            serial.send(command, res => {
//        console.log(res)
                if (res.length > cmdlen
                    && res.indexOf(command.slice(0, cmdlen)) === 0
                    && res[cmdlen] === ':'
                ) {
                    res = res.slice(cmdlen + 1).split(delim)[0]

                    if (!res.indexOf('NAK'))
                        model.NakCount++
                    else {
                        model[readKeys[index]] = res
                        index = ++index % readKeys.length
                        if (!index) {
                            model.SuccessCount++
                            model.LastUpdate = new Date().toString()
                            //console.log(model)
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
        serial = new SerialCommand(settings)
            .on('open', send)
            .on('error', err => {
                model.FailCount++
                model.LastError = err
                console.log(err)
            })

        return bus.registerObject(name, this)
    }
}
