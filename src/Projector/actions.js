export const ON = 'ON'
export const OFF = 'OFF'

export const on = () => ({type: ON})
export const off = () => ({type: OFF})

export const command = action => action.type === ON ? 'on' : action.type === OFF ? 'off' : undefined