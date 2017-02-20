export const
    INIT_DEVICE = 'INIT_DEVICE',
    initDevice = device => ({type: INIT_DEVICE, device})

import {switchActions} from '@theatersoft/device'
export const {ON, OFF, on, off} = switchActions

export const command = action => action.type === ON ? 'on' : action.type === OFF ? 'off' : undefined