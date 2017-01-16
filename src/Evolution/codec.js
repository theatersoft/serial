import SerialCommand from '../SerialCommand'
import * as actions from './actions'
import {bindActionCreators} from 'redux'

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

export default function ({settings, store: {dispatch, getState}}) {
    let serial,
        index = 0
    const {setProp, setInfo, nak, success, fail} = bindActionCreators(actions, dispatch)
    const send = () => {
        const
            command = `S1${readKeys[index]}?\r\n`,
            cmdlen = command.indexOf('?')
        serial.send(command, res => {
            if (res.length > cmdlen
                && res.indexOf(command.slice(0, cmdlen)) === 0
                && res[cmdlen] === ':'
            ) {
                res = res.slice(cmdlen + 1).split(delim)[0]

                if (!res.indexOf('NAK'))
                    nak()
                else {
                    if (getState().device.value[readKeys[index]] !== res )
                        setProp(readKeys[index], res)
                    index = ++index % readKeys.length
                    if (!index) {
                        success()
                        setInfo('LastUpdate', new Date().toLocaleString())
                    }
                }
            } else {
                fail()
                setInfo('LastError', res)
            }
            send()
        })
    }
    serial = new SerialCommand(settings)
        .on('open', send)
        .on('error', err => {
            fail()
            setInfo('LastError', err)
            console.log(err)
        })
}
