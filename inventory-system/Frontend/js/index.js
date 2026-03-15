const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
};

const username = localStorage.getItem("username")

document.addEventListener("DOMContentLoaded", () => {

if(!username){
window.location.href="login.html"
return
}

const nameDisplay = document.getElementById("usernameDisplay")
if(nameDisplay){
nameDisplay.innerText = username
}

})

const API="http://localhost:3000/products"

let chart

async function load(){

const table=document.getElementById("productTable")

if(table){
table.innerHTML="<tr><td colspan='5'>Loading...</td></tr>"
}

const res=await fetch(API)
const data=await res.json()

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

drawChart(data)

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

async function editProduct(id, oldName, oldMin) {
    const name = prompt("แก้ไขชื่อสินค้า", oldName);
    const min = prompt("แก้ไขขั้นต่ำการแจ้งเตือน", oldMin);

    if (name && min) {
        await fetch(API + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, min_stock: Number(min) })
        });
        load();
    }
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

const input=document.getElementById("search").value.toLowerCase()

const rows=document.querySelectorAll("#productTable tr")

rows.forEach(row=>{

const name=row.children[1].innerText.toLowerCase()

if(name.includes(input)){

row.style.display=""

}else{

row.style.display="none"

}

})

}

function drawChart(data){

const names=data.map(p=>p.name)
const stocks=data.map(p=>p.stock)

const ctx=document.getElementById("productChart")

if(chart){
chart.destroy()
}

chart=new Chart(ctx,{

type:"bar",

data:{
labels:names,
datasets:[{
label:"จำนวนสินค้า",
data:stocks,
backgroundColor:"#2f80ed"
}]
}

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

function logout(){

localStorage.removeItem("username")
localStorage.removeItem("token")

window.location.href="login.html"

}

load()