export const
    INIT_DEVICE = 'INIT_DEVICE'
export const
    initDevice = device => ({type: INIT_DEVICE, device})

// switch
export const
    ON = 'ON',
    OFF = 'OFF'
export const
    on = id => ({type: ON, id}),
    off = id => ({type: OFF, id})

export const command = action => action.type === ON ? 'on' : action.type === OFF ? 'off' : undefined