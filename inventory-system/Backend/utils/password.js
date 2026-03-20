const crypto = require("crypto")

function createHash(password, salt){
return crypto.scryptSync(password, salt, 64).toString("hex")
}

function hashPassword(password){
const salt = crypto.randomBytes(16).toString("hex")
const hash = createHash(password, salt)

return `${salt}:${hash}`
}

function verifyPassword(password, storedHash){
if(!storedHash || !storedHash.includes(":")){
return false
}

const [salt, savedHash] = storedHash.split(":")
const newHash = createHash(password, salt)

return crypto.timingSafeEqual(
Buffer.from(savedHash, "hex"),
Buffer.from(newHash, "hex")
)
}

module.exports = {
hashPassword,
verifyPassword
}
