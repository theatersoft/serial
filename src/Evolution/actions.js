export const
    PROP = 'PROP',
    setProp = (prop, value) => ({type: PROP, prop, value}),
    INFO = 'INFO',
    setInfoProp = (prop, value) => ({type: INFO, prop, value}),
    NAK = 'Nak',
    nak = () => ({type: NAK}),
    FAIL = 'Fail',
    fail = () => ({type: FAIL}),
    SUCCESS = 'Success',
    success = () => ({type: SUCCESS})
