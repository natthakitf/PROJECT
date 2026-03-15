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
let reportChart

document.addEventListener("DOMContentLoaded",()=>{
if(!username){
window.location.href = "login.html"
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
table.innerHTML = "<tr><td colspan='5'>กำลังโหลด...</td></tr>"
}

const res = await fetch(API)
const data = await res.json()

if(table){
table.innerHTML = ""
}

if(alertBox){
alertBox.innerHTML = ""
}

let low = 0

data.forEach((p)=>{
if(p.stock <= p.min_stock){
low++

if(alertBox){
alertBox.innerHTML += `<div class="alertItem">สินค้า ${p.name} ใกล้หมด</div>`
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
<button class="secondary-btn table-action" onclick="stockIn(${p.id})">รับเข้า</button>
<button class="secondary-btn table-action" onclick="stockOut(${p.id})">จ่ายออก</button>
<button class="delete table-action" onclick="deleteProduct(${p.id})">ลบ</button>
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

renderProductsDashboard(data)

const chartCanvas = document.getElementById("productChart")

if(chartCanvas){
drawChart(data)
}

loadHistory()
loadReportDashboard()
}

async function addProduct(){
const name = document.getElementById("name").value
const stock = document.getElementById("stock").value
const min = document.getElementById("min").value

if(!name.trim() || stock === "" || min === ""){
alert("กรุณากรอกข้อมูลสินค้าให้ครบ")
return
}

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

closeModal()
document.getElementById("name").value = ""
document.getElementById("stock").value = ""
document.getElementById("min").value = ""

load()
}

function openModal(){
const modal = document.getElementById("productModal")

if(modal){
modal.style.display = "flex"
}
}

function closeModal(){
const modal = document.getElementById("productModal")

if(modal){
modal.style.display = "none"
}
}

async function deleteProduct(id){
await fetch(API+"/"+id,{
method:"DELETE"
})

load()
}

async function stockIn(id){
if(!id){
id = prompt("ใส่รหัสสินค้า")
}

const qty = prompt("จำนวนที่รับเข้า")

if(!qty) return

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
id = prompt("ใส่รหัสสินค้า")
}

const qty = prompt("จำนวนที่จ่ายออก")

if(!qty) return

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

const history = await fetchReportHistory()

table.innerHTML = ""

history.forEach((h)=>{
table.innerHTML += `
<tr>
<td>${h.name}</td>
<td>${h.type === "IN" ? "รับเข้า" : "จ่ายออก"}</td>
<td>${h.quantity}</td>
<td>${formatThaiDate(h.created_at)}</td>
</tr>
`
})

renderHistoryDashboard(history)
}

function searchProduct(){
const input = document.getElementById("search")

if(!input) return

const keyword = input.value.toLowerCase()
const rows = document.querySelectorAll("#productTable tr")

rows.forEach((row)=>{
const nameCell = row.children[1]

if(!nameCell) return

const name = nameCell.innerText.toLowerCase()
row.style.display = name.includes(keyword) ? "" : "none"
})
}

function drawChart(data){
const ctx = document.getElementById("productChart")

if(!ctx) return

const names = data.map((p)=>p.name)
const stocks = data.map((p)=>p.stock)

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
backgroundColor:"#111827",
borderRadius:10
}]
},
options:{
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true,
grid:{
color:"rgba(148,163,184,0.18)"
}
},
x:{
grid:{
display:false
}
}
}
}
})
}

async function dailyReport(){
const history = await fetchReportHistory()
renderReport(history,"daily")
}

async function monthlyReport(){
const history = await fetchReportHistory()
renderReport(history,"monthly")
}

function logout(){
localStorage.removeItem("username")
localStorage.removeItem("token")
window.location.href = "login.html"
}

async function fetchReportHistory(){
const res = await fetch(API+"/history")
return res.json()
}

function renderProductsDashboard(products){
const totalCount = document.getElementById("productsTotalCount")
const lowCount = document.getElementById("productsLowCount")
const healthyCount = document.getElementById("productsHealthyCount")
const statusList = document.getElementById("productsStatusList")
const watchList = document.getElementById("productsWatchList")
const lastUpdated = document.getElementById("productsLastUpdated")

if(totalCount){
totalCount.innerText = products.length
}

const lowProducts = products.filter((item)=>item.stock <= item.min_stock)

if(lowCount){
lowCount.innerText = lowProducts.length
}

if(healthyCount){
healthyCount.innerText = products.length - lowProducts.length
}

if(lastUpdated){
lastUpdated.innerText = "อัปเดต " + new Date().toLocaleTimeString("th-TH",{ hour:"2-digit", minute:"2-digit" })
}

if(statusList){
statusList.innerHTML = [
{ label:"สินค้ามากที่สุด", value:findExtremeProduct(products,"max") },
{ label:"สินค้าน้อยที่สุด", value:findExtremeProduct(products,"min") },
{ label:"ค่าเฉลี่ยคงเหลือ", value:calculateAverageStock(products) + " ชิ้น" }
].map((item)=>`
<div class="insight-item">
<span class="insight-label">${item.label}</span>
<strong>${item.value}</strong>
</div>
`).join("")
}

if(watchList){
if(!lowProducts.length){
watchList.innerHTML = "<p class='empty-text'>ยังไม่มีสินค้าที่ต้องจับตา</p>"
}else{
watchList.innerHTML = lowProducts.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">คงเหลือ ${item.stock} จากขั้นต่ำ ${item.min_stock}</span>
<strong>${item.name}</strong>
</div>
<span class="recent-type">LOW</span>
</div>
`).join("")
}
}
}

function renderHistoryDashboard(history){
const totalCount = document.getElementById("historyTotalCount")
const inCount = document.getElementById("historyInCount")
const outCount = document.getElementById("historyOutCount")
const latestTime = document.getElementById("historyLatestTime")
const latestProduct = document.getElementById("historyLatestProduct")
const latestType = document.getElementById("historyLatestType")
const latestQuantity = document.getElementById("historyLatestQuantity")
const recentList = document.getElementById("historyRecentList")

if(totalCount){
totalCount.innerText = history.length
}

if(inCount){
inCount.innerText = history.filter((item)=>item.type === "IN").length
}

if(outCount){
outCount.innerText = history.filter((item)=>item.type === "OUT").length
}

const latest = history[0]

if(latestTime){
latestTime.innerText = latest ? formatThaiDate(latest.created_at) : "ไม่มีข้อมูล"
}

if(latestProduct){
latestProduct.innerText = latest ? latest.name : "-"
}

if(latestType){
latestType.innerText = latest ? (latest.type === "IN" ? "รับเข้า" : "จ่ายออก") : "-"
}

if(latestQuantity){
latestQuantity.innerText = latest ? latest.quantity + " ชิ้น" : "-"
}

if(recentList){
const recent = history.slice(0,3)

if(!recent.length){
recentList.innerHTML = "<p class='empty-text'>ยังไม่มีข้อมูล</p>"
}else{
recentList.innerHTML = recent.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">${formatThaiDate(item.created_at)}</span>
<strong>${item.name}</strong>
<span class="recent-meta">จำนวน ${item.quantity} ชิ้น</span>
</div>
<span class="recent-type">${item.type === "IN" ? "IN" : "OUT"}</span>
</div>
`).join("")
}
}
}

async function loadReportDashboard(){
const report = document.getElementById("report")

if(!report) return

const history = await fetchReportHistory()
renderRecentActivity(history)
renderLatestInsight(history)
renderReport(history,"daily")
}

function renderReport(history,mode){
const report = document.getElementById("report")
const totalMoves = document.getElementById("reportTotalMoves")
const stockIn = document.getElementById("reportStockIn")
const stockOut = document.getElementById("reportStockOut")
const rangeLabel = document.getElementById("reportRangeLabel")
const badge = document.getElementById("reportBadge")
const dailyBtn = document.getElementById("dailyReportBtn")
const monthlyBtn = document.getElementById("monthlyReportBtn")

if(!report || !totalMoves || !stockIn || !stockOut || !rangeLabel || !badge){
return
}

const now = new Date()
const todayKey = now.toISOString().slice(0,10)

const filtered = history.filter((item)=>{
const created = new Date(item.created_at)

if(mode === "monthly"){
return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
}

return created.toISOString().slice(0,10) === todayKey
})

const inItems = filtered.filter((item)=>item.type === "IN")
const outItems = filtered.filter((item)=>item.type === "OUT")
const totalQty = filtered.reduce((sum,item)=>sum + Number(item.quantity),0)
const inQty = inItems.reduce((sum,item)=>sum + Number(item.quantity),0)
const outQty = outItems.reduce((sum,item)=>sum + Number(item.quantity),0)
const topProduct = findTopProduct(filtered)

report.innerText = mode === "monthly"
? "รายงานเดือนนี้: มีการเคลื่อนไหวสินค้า " + totalQty + " ชิ้น"
: "รายงานวันนี้: มีการเคลื่อนไหวสินค้า " + totalQty + " ชิ้น"

totalMoves.innerText = totalQty
stockIn.innerText = inQty
stockOut.innerText = outQty
rangeLabel.innerText = mode === "monthly" ? "ข้อมูลเดือนปัจจุบัน" : "ข้อมูลวันนี้"
badge.innerText = mode === "monthly" ? "เดือนนี้" : "วันนี้"

updateReportButtons(mode,dailyBtn,monthlyBtn)
renderReportChart(filtered,mode,topProduct)
}

function updateReportButtons(mode,dailyBtn,monthlyBtn){
if(!dailyBtn || !monthlyBtn) return

dailyBtn.className = mode === "daily" ? "primary-btn" : "secondary-btn"
monthlyBtn.className = mode === "monthly" ? "primary-btn" : "secondary-btn"
}

function renderReportChart(history,mode,topProduct){
const canvas = document.getElementById("reportChart")

if(!canvas) return

const grouped = new Map()

history.forEach((item)=>{
const created = new Date(item.created_at)
const label = mode === "monthly"
? created.toLocaleDateString("th-TH",{ day:"numeric", month:"short" })
: created.toLocaleTimeString("th-TH",{ hour:"2-digit", minute:"2-digit" })

grouped.set(label,(grouped.get(label) || 0) + Number(item.quantity))
})

const labels = Array.from(grouped.keys())
const values = Array.from(grouped.values())

if(reportChart){
reportChart.destroy()
}

reportChart = new Chart(canvas,{
type:"line",
data:{
labels:labels.length ? labels : ["ไม่มีข้อมูล"],
datasets:[{
label:topProduct ? "แนวโน้มการเคลื่อนไหว (" + topProduct + ")" : "แนวโน้มการเคลื่อนไหว",
data:values.length ? values : [0],
borderColor:"#111827",
backgroundColor:"rgba(17,24,39,0.08)",
fill:true,
tension:0.35,
pointRadius:4,
pointBackgroundColor:"#111827"
}]
},
options:{
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true,
grid:{
color:"rgba(148,163,184,0.18)"
}
},
x:{
grid:{
display:false
}
}
}
}
})
}

function renderRecentActivity(history){
const recentList = document.getElementById("reportRecentList")

if(!recentList) return

const items = history.slice(0,4)

if(!items.length){
recentList.innerHTML = "<p class='empty-text'>ยังไม่มีข้อมูล</p>"
return
}

recentList.innerHTML = items.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">${formatThaiDate(item.created_at)}</span>
<strong>${item.name}</strong>
<span class="recent-meta">จำนวน ${item.quantity} ชิ้น</span>
</div>
<span class="recent-type">${item.type}</span>
</div>
`).join("")
}

function renderLatestInsight(history){
const latestProduct = document.getElementById("reportLatestProduct")
const latestType = document.getElementById("reportLatestType")
const latestTime = document.getElementById("reportLatestTime")

if(!latestProduct || !latestType || !latestTime) return

const latest = history[0]

if(!latest){
latestProduct.innerText = "-"
latestType.innerText = "-"
latestTime.innerText = "-"
return
}

latestProduct.innerText = latest.name
latestType.innerText = latest.type === "IN" ? "รับเข้า" : "จ่ายออก"
latestTime.innerText = formatThaiDate(latest.created_at)
}

function findTopProduct(history){
if(!history.length) return ""

const totals = {}

history.forEach((item)=>{
totals[item.name] = (totals[item.name] || 0) + Number(item.quantity)
})

return Object.entries(totals).sort((a,b)=>b[1] - a[1])[0][0]
}

function findExtremeProduct(products,mode){
if(!products.length) return "-"

const sorted = [...products].sort((a,b)=>mode === "max" ? b.stock - a.stock : a.stock - b.stock)
const item = sorted[0]
return item.name + " (" + item.stock + " ชิ้น)"
}

function calculateAverageStock(products){
if(!products.length) return 0

const total = products.reduce((sum,item)=>sum + Number(item.stock),0)
return Math.round(total / products.length)
}
