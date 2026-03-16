const mysql = require("mysql2/promise")
const config = require("./config")

const commonOptions = {
waitForConnections:true,
connectionLimit:10,
queueLimit:0
}

function getDatabaseOptions(){
if(process.env.DATABASE_URL){
const databaseUrl = new URL(process.env.DATABASE_URL)

return {
host:databaseUrl.hostname,
port:Number(databaseUrl.port || 3306),
user:decodeURIComponent(databaseUrl.username),
password:decodeURIComponent(databaseUrl.password),
database:databaseUrl.pathname.replace(/^\//,""),
...commonOptions
}
}

return {
host:config.db.host,
user:config.db.user,
password:config.db.password,
database:config.db.database,
port:config.db.port,
...commonOptions
}
}

const db = mysql.createPool(getDatabaseOptions())

module.exports = db
