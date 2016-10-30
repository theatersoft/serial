'use strict'

const
    {default: bus, proxy} = require('@theatersoft/bus'),
    Projector = proxy('Projector')

bus.start().then(() =>
    Projector.hours()
)
