const axios = require('axios')

const ws4 = axios.create({
  baseURL: 'http://localhost:3003'
})

module.exports = ws4