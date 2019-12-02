const mysql = require('mysql')
const util = require('util')

const con = mysql.createConnection({
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_DATABASE
})

const query = util.promisify(con.query).bind(con)

con.connect(err => err ? console.error(err) : console.log('MySQL connected'))

module.exports = query