const API = "http://localhost:3000"

/* โหลดสินค้า */

async function loadProducts(){

 const res = await fetch(API + "/products")
 const data = await res.json()

 const table = document.getElementById("productTable")

 if(!table) return

 table.innerHTML = ""

 data.forEach(p => {

  table.innerHTML += `
  <tr>
  <td>${p.id}</td>
  <td>${p.name}</td>
  <td style="color:${p.stock <= p.min_stock ? 'red':'black'}">
  ${p.stock}
  </td>
  <td>${p.min_stock}</td>
  </tr>
  `

 })

}


/* เพิ่มสินค้า */

async function addProduct(){

 const name = document.getElementById("name").value
 const stock = document.getElementById("stock").value
 const min_stock = document.getElementById("min_stock").value

 await fetch(API + "/products",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body:JSON.stringify({
   name,
   stock:Number(stock),
   min_stock:Number(min_stock)
  })
 })

 alert("Product Added")

 loadProducts()

}


/* Dashboard */

async function loadDashboard(){

 const res = await fetch(API + "/products")
 const data = await res.json()

 const total = document.getElementById("totalProducts")
 const low = document.getElementById("lowStockCount")

 if(total){
  total.innerText = data.length
 }

 const lowProducts = data.filter(p => p.stock <= p.min_stock)

 if(low){
  low.innerText = lowProducts.length
 }

}

window.onload = () =>{
 loadProducts()
 loadDashboard()
}