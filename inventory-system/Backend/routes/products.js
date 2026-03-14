const express=require("express")
const router=express.Router()

const db=require("../db")

// get products

router.get("/",async(req,res)=>{

const [rows]=await db.query("SELECT * FROM products")

res.json(rows)

})

// add product

router.post("/",async(req,res)=>{

const {name,stock,min_stock}=req.body

await db.query(
"INSERT INTO products(name,stock,min_stock) VALUES(?,?,?)",
[name,stock,min_stock]
)

res.json({message:"product added"})

})

// delete product

router.delete("/:id",async(req,res)=>{

await db.query(
"DELETE FROM products WHERE id=?",
[req.params.id]
)

res.json({message:"deleted"})

})

// stock in

router.post("/stockin",async(req,res)=>{

const {id,quantity}=req.body

await db.query(
"UPDATE products SET stock=stock+? WHERE id=?",
[quantity,id]
)

await db.query(
"INSERT INTO stock_history(product_id,type,quantity) VALUES(?,?,?)",
[id,"IN",quantity]
)

res.json({message:"stock added"})

})

// stock out

router.post("/stockout",async(req,res)=>{

const {id,quantity}=req.body

await db.query(
"UPDATE products SET stock=stock-? WHERE id=?",
[quantity,id]
)

await db.query(
"INSERT INTO stock_history(product_id,type,quantity) VALUES(?,?,?)",
[id,"OUT",quantity]
)

res.json({message:"stock removed"})

})

// history

router.get("/history",async(req,res)=>{

const [rows]=await db.query(`
SELECT stock_history.*,products.name
FROM stock_history
JOIN products ON products.id=stock_history.product_id
ORDER BY created_at DESC
`)

res.json(rows)

})

module.exports=router