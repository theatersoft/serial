import SerialCommand from '../SerialCommand'
import {setProp, setInfoProp, nak, success, fail} from './actions'

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

export default function ({settings, store}) {
    let serial,
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
                    store.dispatch(nak())
                else {
                    store.dispatch(setProp(readKeys[index], res))
                    index = ++index % readKeys.length
                    if (!index) {
                        store.dispatch(success())
                        store.dispatch(setInfoProp('LastUpdate', new Date().toString()))
                    }
                }
            } else {
                store.dispatch(fail())
                store.dispatch(setInfoProp('LastError', res))
//            console.log('Fail')
            }
            send()
        })
    }
    serial = new SerialCommand(settings)
        .on('open', send)
        .on('error', err => {
            store.dispatch(fail())
            store.dispatch(setInfoProp('LastError', err))
            console.log(err)
        })
}
