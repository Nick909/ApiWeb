const express   = require('express')
const routes    = express.Router()

const operetorsControl = require('./controllers/OperetorController')


routes.post('/ws-operators/v1/pay', operetorsControl.testOperetor)
routes.get('/ws-operators/v1/status', operetorsControl.status)

module.exports = routes