import {PROP, INFO, NAK, FAIL, SUCCESS} from './actions'

export default function reducer (state, action) {
    switch (action.type) {
    case PROP:
        if (state.value[action.prop] !== action.value)
            return {...state, value: {...state.value, [action.prop]: action.value}}
        break
    case INFO:
            return {...state, info: {...state.info, [action.prop]: action.value}}
    case NAK:
    case FAIL:
    case SUCCESS:
        return {...state, info: {...state.info, [action.type]: state.info[action.type] + 1}}
    }
    return state
}
