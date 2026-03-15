const formatThaiDate = (dateString) => {
const date = new Date(dateString)

return new Intl.DateTimeFormat("th-TH",{
year:"numeric",
month:"short",
day:"numeric",
hour:"2-digit",
minute:"2-digit"
}).format(date)

}

const username = localStorage.getItem("username")

const API = "http://localhost:3000/products"

let chart

document.addEventListener("DOMContentLoaded",()=>{

if(!username){
window.location.href="login.html"
return
}

const nameDisplay = document.getElementById("usernameDisplay")

if(nameDisplay){
nameDisplay.innerText = username
}

load()

})

async function load(){

const table = document.getElementById("productTable")
const alertBox = document.getElementById("lowStockAlert")

if(table){
table.innerHTML="<tr><td colspan='5'>Loading...</td></tr>"
}

const res = await fetch(API)
const data = await res.json()

if(table){
table.innerHTML=""
}

if(alertBox){
alertBox.innerHTML=""
}

let low = 0

data.forEach(p=>{

if(p.stock <= p.min_stock){

low++

if(alertBox){
alertBox.innerHTML += `
<div class="alertItem">
⚠ สินค้า ${p.name} ใกล้หมด
</div>
`
}

}

if(table){

table.innerHTML += `
<tr>

<td>${p.id}</td>
<td>${p.name}</td>
<td>${p.stock}</td>
<td>${p.min_stock}</td>

<td>

<button onclick="stockIn(${p.id})">📥</button>

<button onclick="stockOut(${p.id})">📤</button>

<button class="delete" onclick="deleteProduct(${p.id})">🗑</button>

</td>

</tr>
`

}

})

const totalProducts = document.getElementById("totalProducts")
const lowStock = document.getElementById("lowStock")

if(totalProducts){
totalProducts.innerText = data.length
}

if(lowStock){
lowStock.innerText = low
}

const chartCanvas = document.getElementById("productChart")

if(chartCanvas){
drawChart(data)
}

loadHistory()

}

async function addProduct(){

const name = document.getElementById("name").value
const stock = document.getElementById("stock").value
const min = document.getElementById("min").value

await fetch(API,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
stock,
min_stock:min
})
})

load()

}

async function deleteProduct(id){

await fetch(API+"/"+id,{
method:"DELETE"
})

load()

}

async function stockIn(id){

if(!id){
id = prompt("ใส่ Product ID")
}

const qty = prompt("จำนวนที่นำเข้า")

await fetch(API+"/stockin",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
id:Number(id),
quantity:Number(qty)
})
})

load()

}

async function stockOut(id){

if(!id){
id = prompt("ใส่ Product ID")
}

const qty = prompt("จำนวนที่นำออก")

await fetch(API+"/stockout",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
id:Number(id),
quantity:Number(qty)
})
})

load()

}

async function loadHistory(){

const table = document.getElementById("historyTable")

if(!table) return

const res = await fetch(API+"/history")
const data = await res.json()

table.innerHTML=""

data.forEach(h=>{

table.innerHTML += `
<tr>
<td>${h.name}</td>
<td>${h.type}</td>
<td>${h.quantity}</td>
<td>${formatThaiDate(h.created_at)}</td>
</tr>
`

})

}

function searchProduct(){

const input = document.getElementById("search")

if(!input) return

const keyword = input.value.toLowerCase()

const rows = document.querySelectorAll("#productTable tr")

rows.forEach(row=>{

const name = row.children[1].innerText.toLowerCase()

if(name.includes(keyword)){
row.style.display=""
}else{
row.style.display="none"
}

})

}

function drawChart(data){

const ctx = document.getElementById("productChart")

if(!ctx) return

const names = data.map(p=>p.name)
const stocks = data.map(p=>p.stock)

if(chart){
chart.destroy()
}

chart = new Chart(ctx,{
type:"bar",
data:{
labels:names,
datasets:[{
label:"จำนวนสินค้า",
data:stocks,
backgroundColor:"#3b82f6"
}]
}
})

}

async function dailyReport(){

const res = await fetch(API+"/history")
const data = await res.json()

const today = new Date().toISOString().slice(0,10)

let total = 0

data.forEach(h=>{

if(h.created_at.slice(0,10) === today){
total += Number(h.quantity)
}

})

const report = document.getElementById("report")

if(report){

report.innerText =
"📊 รายงานวันนี้ : มีการเคลื่อนไหวสินค้า " + total + " ชิ้น"

}

}

async function monthlyReport(){

const res = await fetch(API+"/history")
const data = await res.json()

const month = new Date().toISOString().slice(0,7)

let total = 0

data.forEach(h=>{

if(h.created_at.slice(0,7) === month){
total += Number(h.quantity)
}

})

const report = document.getElementById("report")

if(report){

report.innerText =
"📈 รายงานเดือนนี้ : มีการเคลื่อนไหวสินค้า " + total + " ชิ้น"

}

}

function logout(){

localStorage.removeItem("username")
localStorage.removeItem("token")

window.location.href="login.html"

}