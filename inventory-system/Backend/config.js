const fs = require("fs")
const path = require("path")

const envPath = path.join(__dirname, ".env")

if(fs.existsSync(envPath)){
const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/)

lines.forEach((line)=>{
const trimmed = line.trim()

if(!trimmed || trimmed.startsWith("#")) return

const separatorIndex = trimmed.indexOf("=")

if(separatorIndex === -1) return

const key = trimmed.slice(0, separatorIndex).trim()
const value = trimmed.slice(separatorIndex + 1).trim()

if(key && process.env[key] === undefined){
process.env[key] = value
}
})
}

module.exports = {
port:Number(process.env.PORT || 3000),
clientOrigin:process.env.CLIENT_ORIGIN || "*",
nodeEnv:process.env.NODE_ENV || "development",
publicDir:path.join(__dirname, "..", "Frontend"),
db:{
host:process.env.DB_HOST || "localhost",
user:process.env.DB_USER || "root",
password:process.env.DB_PASSWORD || "root",
database:process.env.DB_NAME || "inventory",
port:Number(process.env.DB_PORT || 3307)
},
jwtSecret:process.env.JWT_SECRET || "inventory_secret_change_me"
}
