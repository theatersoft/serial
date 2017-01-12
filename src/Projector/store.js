import {createStore} from 'redux'
import {INIT_DEVICE, ON, on, OFF, off} from './actions'

function reducer (state, action) {
    switch (action.type) {
    case INIT_DEVICE:
        return {...state, device: action.device, value: false}
    case ON:
        return {...state, value: true, action: off()}
    case OFF:
        return {...state, value: false, action: on()}
    }
    return state
}

export default createStore(
    reducer,
    {},
    devToolsEnhancer({name: 'Projector', realtime: true, port: 6400})
)
