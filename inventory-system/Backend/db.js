const mysql = require("mysql2")

const db = mysql.createConnection({
 host: "localhost",
 port: 3307,
 user: "root",
 password: "root",
 database: "inventory"
})

db.connect(err=>{
 if(err){
  console.log(err)
 }else{
  console.log("MySQL Connected")
 }
})

module.exports = db