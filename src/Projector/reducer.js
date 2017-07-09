import {INIT_DEVICE, ON, OFF} from './actions'

export default function reducer (state, {type, device}) {
    switch (type) {
    case INIT_DEVICE:
        return {device}
    case ON:
    case OFF:
        return {...state, device: {...state.device, value: type === ON}}
    }
    return state
}

