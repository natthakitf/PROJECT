const express = require("express")
const cors = require("cors")
const db = require("./db")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
 res.send("Inventory API Running")
})

app.get("/products",(req,res)=>{

 db.query("SELECT * FROM products",(err,result)=>{

  if(err){
   res.json(err)
  }else{
   res.json(result)
  }

 })

})

app.post("/products",(req,res)=>{

 const {name,stock,min_stock} = req.body

 const sql = "INSERT INTO products (name,stock,min_stock) VALUES (?,?,?)"

 db.query(sql,[name,stock,min_stock],(err,result)=>{

  if(err){
   res.json(err)
  }else{
   res.json({
    message:"product added"
   })
  }

 })

})

app.post("/stock/in",(req,res)=>{

 const {id,quantity} = req.body

 const sql = "UPDATE products SET stock = stock + ? WHERE id = ?"

 db.query(sql,[quantity,id],(err,result)=>{

  if(err){
   res.json(err)
  }else{
   res.json({
    message:"stock added"
   })
  }

 })

})

app.post("/stock/out",(req,res)=>{

 const {id,quantity} = req.body

 const sql = "UPDATE products SET stock = stock - ? WHERE id = ?"

 db.query(sql,[quantity,id],(err,result)=>{

  if(err){
   res.json(err)
  }else{
   res.json({
    message:"stock removed"
   })
  }

 })

})

app.get("/low-stock",(req,res)=>{

 const sql = "SELECT * FROM products WHERE stock <= min_stock"

 db.query(sql,(err,result)=>{

  if(err){
   res.json(err)
  }else{
   res.json(result)
  }

 })

})

app.delete("/products/:id",(req,res)=>{

const id=req.params.id

db.query("DELETE FROM products WHERE id=?",[id],(err,result)=>{

if(err){
res.json(err)
}else{
res.json({message:"Product deleted"})
}

})

})

app.put("/products/:id",(req,res)=>{

const id=req.params.id
const {name,stock,min_stock}=req.body

db.query(
"UPDATE products SET name=?, stock=?, min_stock=? WHERE id=?",
[name,stock,min_stock,id],
(err,result)=>{

if(err){
res.json(err)
}else{
res.json({message:"Product updated"})
}

})

})

app.listen(3000, ()=>{
 console.log("Server running on port 3000")
})