const express = require("express")
const router = express.Router()

const db = require("../db")

router.post("/login", async (req,res)=>{

const {username,password} = req.body

try{

const [result] = await db.query(
"SELECT * FROM users WHERE username=? AND password=?",
[username,password]
)

if(result.length > 0){

res.status(200).json({message:"login success"})

}else{

res.status(401).json({message:"login failed"})

}

}catch(err){

console.log(err)
res.status(500).json({message:"server error"})

}

})

module.exports = router