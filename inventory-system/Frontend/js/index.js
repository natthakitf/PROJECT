const API="http://localhost:3000/products"

async function load(){

const res=await fetch(API)
const data=await res.json()

const table=document.getElementById("productTable")
const alertBox=document.getElementById("lowStockAlert")

table.innerHTML=""
alertBox.innerHTML=""

let low=0

data.forEach(p=>{

if(p.stock <= p.min_stock){

low++

alertBox.innerHTML += `
<div class="alertItem">
⚠ สินค้า ${p.name} ใกล้หมด
</div>
`

}

table.innerHTML += `
<tr>
<td>${p.id}</td>
<td>${p.name}</td>
<td>${p.stock}</td>
<td>${p.min_stock}</td>
<td>
<button class="delete" onclick="deleteProduct(${p.id})">ลบ</button>
</td>
</tr>
`

})

document.getElementById("totalProducts").innerText=data.length
document.getElementById("lowStock").innerText=low
document.getElementById("notifyCount").innerText=low

loadHistory()

}

async function addProduct(){

const name=document.getElementById("name").value
const stock=document.getElementById("stock").value
const min=document.getElementById("min").value

await fetch(API,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,stock,min_stock:min})
})

load()

}

async function deleteProduct(id){

await fetch(API+"/"+id,{
method:"DELETE"
})

load()

}

async function stockIn(){

const id=prompt("ใส่ Product ID")
const qty=prompt("จำนวน")

await fetch(API+"/stockin",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
id:Number(id),
quantity:Number(qty)
})
})

load()

}

async function stockOut(){

const id=prompt("ใส่ Product ID")
const qty=prompt("จำนวน")

await fetch(API+"/stockout",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
id:Number(id),
quantity:Number(qty)
})
})

load()

}

async function loadHistory(){

const res=await fetch(API+"/history")
const data=await res.json()

const table=document.getElementById("historyTable")

table.innerHTML=""

data.forEach(h=>{

table.innerHTML+=`
<tr>
<td>${h.name}</td>
<td>${h.type}</td>
<td>${h.quantity}</td>
<td>${h.created_at}</td>
</tr>
`

})

}

async function dailyReport(){

const res = await fetch(API + "/history")
const data = await res.json()

const today = new Date().toISOString().slice(0,10)

let total = 0

data.forEach(h=>{

if(h.created_at.slice(0,10) === today){

total += Number(h.quantity)

}

})

document.getElementById("report").innerText =
"📊 รายงานวันนี้ : มีการเคลื่อนไหวสินค้า " + total + " ชิ้น"

}

async function monthlyReport(){

const res = await fetch(API + "/history")
const data = await res.json()

const month = new Date().toISOString().slice(0,7)

let total = 0

data.forEach(h=>{

if(h.created_at.slice(0,7) === month){

total += Number(h.quantity)

}

})

document.getElementById("report").innerText =
"📈 รายงานเดือนนี้ : มีการเคลื่อนไหวสินค้า " + total + " ชิ้น"

}

load()