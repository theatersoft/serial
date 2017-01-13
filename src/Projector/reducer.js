import {INIT_DEVICE, ON, on, OFF, off} from './actions'

export default function reducer (state, {type, device}) {
    switch (type) {
    case INIT_DEVICE:
        return {...device}
    case ON:
    case OFF:
        return {...state, value: type === ON}
    }
    return state
}

