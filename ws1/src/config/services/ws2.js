const axios = require('axios')

const ws2 = axios.create({
    baseURL: 'http://localhost:3001'
})

module.exports = ws2