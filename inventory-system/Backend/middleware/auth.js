const jwt = require("jsonwebtoken")
const config = require("../config")

function requireAuth(req,res,next){
const authHeader = req.headers.authorization || ""
const [scheme, token] = authHeader.split(" ")

if(scheme !== "Bearer" || !token){
return res.status(401).json({ message:"Authentication required" })
}

try{
const payload = jwt.verify(token, config.jwtSecret)
req.user = payload
next()
}catch(err){
return res.status(401).json({ message:"Invalid or expired token" })
}
}

module.exports = {
requireAuth
}
