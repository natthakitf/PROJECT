const express = require("express")
const router = express.Router()
const db = require("../db")
const jwt = require("jsonwebtoken")
const config = require("../config")
const { verifyPassword } = require("../utils/password")

router.post("/login", async (req,res)=>{
const { username, password } = req.body

if(!username || !password){
return res.status(400).json({ message:"Username and password are required" })
}

try{
const [result] = await db.query(
"SELECT id, username, password_hash, role FROM users WHERE username=? LIMIT 1",
[username]
)

if(result.length === 0){
return res.status(401).json({ message:"Invalid username or password" })
}

const user = result[0]
const isValidPassword = verifyPassword(password, user.password_hash)

if(!isValidPassword){
return res.status(401).json({ message:"Invalid username or password" })
}

const token = jwt.sign(
{ id:user.id, username:user.username, role:user.role },
config.jwtSecret,
{ expiresIn:"2h" }
)

res.status(200).json({
message:"Login successful",
token,
username:user.username,
role:user.role
})

}catch(err){
console.error("Login error:",err)
res.status(500).json({ message:"Server error" })
}
})

module.exports = router
