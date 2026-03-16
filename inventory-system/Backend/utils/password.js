const crypto = require("crypto")

function hashPassword(password){
const salt = crypto.randomBytes(16).toString("hex")
const hash = crypto.scryptSync(password, salt, 64).toString("hex")

return `${salt}:${hash}`
}

function verifyPassword(password, storedHash){
if(!storedHash || !storedHash.includes(":")){
return false
}

const [salt, originalHash] = storedHash.split(":")
const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex")

return crypto.timingSafeEqual(
Buffer.from(originalHash, "hex"),
Buffer.from(candidateHash, "hex")
)
}

module.exports = {
hashPassword,
verifyPassword
}
