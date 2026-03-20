const mysql = require("mysql2/promise")

const config = require("./config")

const poolOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    const databaseUrl = new URL(process.env.DATABASE_URL)

    return {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.replace(/^\//, ""),
      ...poolOptions
    }
  }

  return {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ...poolOptions
  }
}

module.exports = mysql.createPool(getDatabaseConfig())
