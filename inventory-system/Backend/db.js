const mysql = require("mysql2/promise")

const db = mysql.createPool({
host:"localhost",
user:"root",
password:"root",
database:"inventory",
port:3307
})

module.exports = db