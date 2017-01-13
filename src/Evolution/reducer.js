import {PROP, INFO, NAK, FAIL, SUCCESS} from './actions'

export default function reducer (state, action) {
    switch (action.type) {
    case PROP:
        return {...state, device: {...state.device, value: {...state.device.value, [action.prop]: action.value}}}
    case INFO:
        return {...state, info: {...state.info, [action.prop]: action.value}}
    case NAK:
    case FAIL:
    case SUCCESS:
        return {...state, info: {...state.info, [action.type]: state.info[action.type] + 1}}
    }
    return state
}
