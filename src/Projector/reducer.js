import {INIT_DEVICE, ON, on, OFF, off} from './actions'

export default function reducer (state, action) {
    switch (action.type) {
    case INIT_DEVICE:
        return {...state, device: action.device, value: false}
    case ON:
        return {...state, value: true}
    case OFF:
        return {...state, value: false}
    }
    return state
}

