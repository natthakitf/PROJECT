const express = require("express")
const router = express.Router()
const db = require("../db")
const jwt = require("jsonwebtoken")

const SECRET = "inventory_secret"

router.post("/login", async (req,res)=>{

const {username,password} = req.body

try{

const [result] = await db.query(
"SELECT * FROM users WHERE username=? AND password=?",
[username,password]
)

if(result.length > 0){

const user = result[0]

const token = jwt.sign(
{ id:user.id, username:user.username },
SECRET,
{ expiresIn:"2h" }
)

res.json({
message:"login success",
token,
username:user.username
})

}else{

res.status(401).json({message:"login failed"})

}

}catch(err){

console.log(err)
res.status(500).json({message:"server error"})

}

})

module.exports = router