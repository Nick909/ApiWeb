const express = require('express')
const routes = express.Router()

const cardControl = require('./controller/cardController')

routes.post('/ws-banks/v1/pay/', cardControl.card )
routes.get('/ws-banks/v1/status', cardControl.status)

module.exports = routes