const express = require('express')
const routes = express.Router()

const brandControl = require('./controller/brandsControllers')

routes.post('/ws-brands/v1/pay', brandControl.testBrand)
routes.get('/ws-brands/v1/status', brandControl.status)
routes.get('/ws-brands/v1/installments-limit', brandControl.installmentsLimit)

module.exports = routes

