const express=require("express")
const cors=require("cors")

const products=require("./routes/products")

const app=express()

app.use(cors())
app.use(express.json())

app.use("/products",products)

app.listen(3000,()=>{

console.log("Server running on port 3000")

})