const API_BASE = window.location.origin
const PRODUCTS_API = `${API_BASE}/products`

let inventoryChart
let reportChart

document.addEventListener("DOMContentLoaded",()=>{
const token = localStorage.getItem("token")

if(!token){
window.location.href = "login.html"
return
}

renderUsername()
initializePage().catch(handleUnexpectedError)
})

async function initializePage(){
const shouldLoadProducts = Boolean(
document.getElementById("productTable") ||
document.getElementById("totalProducts") ||
document.getElementById("productChart") ||
document.getElementById("productsTotalCount")
)

const shouldLoadHistory = Boolean(
document.getElementById("historyTable") ||
document.getElementById("historyTotalCount") ||
document.getElementById("report")
)

let products = []
let history = []

if(shouldLoadProducts){
products = await fetchProducts()
renderProductsTable(products)
renderDashboardSummary(products)
renderProductsDashboard(products)
renderProductChart(products)
}

if(shouldLoadHistory){
history = await fetchHistory()
renderHistoryTable(history)
renderHistoryDashboard(history)
renderReportDashboard(history)
}
}

function renderUsername(){
const usernameDisplay = document.getElementById("usernameDisplay")
const username = localStorage.getItem("username")

if(usernameDisplay && username){
usernameDisplay.innerText = username
}
}

async function apiRequest(url, options = {}){
const token = localStorage.getItem("token")
const headers = {
...(options.headers || {}),
Authorization:`Bearer ${token}`
}

if(options.body && !headers["Content-Type"]){
headers["Content-Type"] = "application/json"
}

const response = await fetch(url,{
...options,
headers
})

const contentType = response.headers.get("content-type") || ""
const payload = contentType.includes("application/json")
? await response.json()
: null

if(response.status === 401){
logout()
throw new Error("Session expired")
}

if(!response.ok){
throw new Error(payload?.message || "Request failed")
}

return payload
}

async function fetchProducts(){
setTableLoading("productTable",5,"กำลังโหลดข้อมูลสินค้า...")
return apiRequest(PRODUCTS_API)
}

async function fetchHistory(){
setTableLoading("historyTable",4,"กำลังโหลดประวัติ...")
return apiRequest(`${PRODUCTS_API}/history`)
}

function setTableLoading(tableId, columns, text){
const table = document.getElementById(tableId)

if(table){
table.innerHTML = `<tr><td colspan="${columns}">${text}</td></tr>`
}
}

function renderProductsTable(products){
const table = document.getElementById("productTable")

if(!table) return

if(!products.length){
table.innerHTML = "<tr><td colspan='5'>ยังไม่มีสินค้าในระบบ</td></tr>"
return
}

table.innerHTML = products.map((product)=>`
<tr>
<td>${product.id}</td>
<td>${product.name}</td>
<td>${product.stock}</td>
<td>${product.min_stock}</td>
<td>
<button class="secondary-btn table-action" onclick="stockIn(${product.id})">รับเข้า</button>
<button class="secondary-btn table-action" onclick="stockOut(${product.id})">จ่ายออก</button>
<button class="delete table-action" onclick="deleteProduct(${product.id})">ลบ</button>
</td>
</tr>
`).join("")
}

function renderDashboardSummary(products){
const totalProducts = document.getElementById("totalProducts")
const lowStock = document.getElementById("lowStock")
const lowStockAlert = document.getElementById("lowStockAlert")
const lowProducts = products.filter((product)=>product.stock <= product.min_stock)

if(totalProducts){
totalProducts.innerText = products.length
}

if(lowStock){
lowStock.innerText = lowProducts.length
}

if(lowStockAlert){
lowStockAlert.innerHTML = lowProducts.length
? lowProducts.map((product)=>`<div class="alertItem">สินค้า ${product.name} ใกล้หมด</div>`).join("")
: ""
}
}

function renderProductsDashboard(products){
const totalCount = document.getElementById("productsTotalCount")
const lowCount = document.getElementById("productsLowCount")
const healthyCount = document.getElementById("productsHealthyCount")
const statusList = document.getElementById("productsStatusList")
const watchList = document.getElementById("productsWatchList")
const lastUpdated = document.getElementById("productsLastUpdated")
const lowProducts = products.filter((item)=>item.stock <= item.min_stock)

if(totalCount){
totalCount.innerText = products.length
}

if(lowCount){
lowCount.innerText = lowProducts.length
}

if(healthyCount){
healthyCount.innerText = products.length - lowProducts.length
}

if(lastUpdated){
lastUpdated.innerText = `อัปเดต ${new Date().toLocaleTimeString("th-TH",{ hour:"2-digit", minute:"2-digit" })}`
}

if(statusList){
statusList.innerHTML = [
{ label:"สินค้ามากที่สุด", value:findExtremeProduct(products,"max") },
{ label:"สินค้าน้อยที่สุด", value:findExtremeProduct(products,"min") },
{ label:"ค่าเฉลี่ยคงเหลือ", value:`${calculateAverageStock(products)} ชิ้น` }
].map((item)=>`
<div class="insight-item">
<span class="insight-label">${item.label}</span>
<strong>${item.value}</strong>
</div>
`).join("")
}

if(watchList){
watchList.innerHTML = lowProducts.length
? lowProducts.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">คงเหลือ ${item.stock} จากขั้นต่ำ ${item.min_stock}</span>
<strong>${item.name}</strong>
</div>
<span class="recent-type">LOW</span>
</div>
`).join("")
: "<p class='empty-text'>ยังไม่มีสินค้าใกล้หมด</p>"
}
}

function renderProductChart(products){
const canvas = document.getElementById("productChart")

if(!canvas) return

const labels = products.map((product)=>product.name)
const values = products.map((product)=>product.stock)

if(inventoryChart){
inventoryChart.destroy()
}

inventoryChart = new Chart(canvas,{
type:"bar",
data:{
labels,
datasets:[{
label:"จำนวนสินค้า",
data:values,
backgroundColor:"#111827",
borderRadius:10
}]
},
options:{
plugins:{
legend:{ display:false }
},
scales:{
y:{
beginAtZero:true,
grid:{ color:"rgba(148,163,184,0.18)" }
},
x:{
grid:{ display:false }
}
}
}
})
}

function renderHistoryTable(history){
const table = document.getElementById("historyTable")

if(!table) return

if(!history.length){
table.innerHTML = "<tr><td colspan='4'>ยังไม่มีประวัติการเคลื่อนไหว</td></tr>"
return
}

table.innerHTML = history.map((item)=>`
<tr>
<td>${item.name}</td>
<td>${item.type === "IN" ? "รับเข้า" : "จ่ายออก"}</td>
<td>${item.quantity}</td>
<td>${formatThaiDate(item.created_at)}</td>
</tr>
`).join("")
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
const latest = history[0]

if(totalCount){
totalCount.innerText = history.length
}

if(inCount){
inCount.innerText = history.filter((item)=>item.type === "IN").length
}

if(outCount){
outCount.innerText = history.filter((item)=>item.type === "OUT").length
}

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
latestQuantity.innerText = latest ? `${latest.quantity} ชิ้น` : "-"
}

if(recentList){
const items = history.slice(0,3)
recentList.innerHTML = items.length
? items.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">${formatThaiDate(item.created_at)}</span>
<strong>${item.name}</strong>
<span class="recent-meta">จำนวน ${item.quantity} ชิ้น</span>
</div>
<span class="recent-type">${item.type}</span>
</div>
`).join("")
: "<p class='empty-text'>ยังไม่มีข้อมูล</p>"
}
}

function renderReportDashboard(history){
if(!document.getElementById("report")) return

renderRecentActivity(history)
renderLatestInsight(history)
renderReport(history,"daily")
}

function renderReport(history, mode){
const reportText = document.getElementById("report")
const totalMoves = document.getElementById("reportTotalMoves")
const stockIn = document.getElementById("reportStockIn")
const stockOut = document.getElementById("reportStockOut")
const rangeLabel = document.getElementById("reportRangeLabel")
const badge = document.getElementById("reportBadge")
const dailyButton = document.getElementById("dailyReportBtn")
const monthlyButton = document.getElementById("monthlyReportBtn")

if(!reportText || !totalMoves || !stockIn || !stockOut || !rangeLabel || !badge){
return
}

const now = new Date()
const todayKey = getLocalDateKey(now)
const filtered = history.filter((item)=>{
const createdAt = new Date(item.created_at)

if(mode === "monthly"){
return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()
}

return getLocalDateKey(createdAt) === todayKey
})

const totalQuantity = sumQuantities(filtered)
const stockInQuantity = sumQuantities(filtered.filter((item)=>item.type === "IN"))
const stockOutQuantity = sumQuantities(filtered.filter((item)=>item.type === "OUT"))
const topProduct = findTopProduct(filtered)

reportText.innerText = mode === "monthly"
? `รายงานเดือนนี้: มีการเคลื่อนไหวสินค้า ${totalQuantity} ชิ้น`
: `รายงานวันนี้: มีการเคลื่อนไหวสินค้า ${totalQuantity} ชิ้น`

totalMoves.innerText = totalQuantity
stockIn.innerText = stockInQuantity
stockOut.innerText = stockOutQuantity
rangeLabel.innerText = mode === "monthly" ? "ข้อมูลเดือนปัจจุบัน" : "ข้อมูลวันนี้"
badge.innerText = mode === "monthly" ? "เดือนนี้" : "วันนี้"

updateReportButtons(mode, dailyButton, monthlyButton)
renderReportChart(filtered, mode, topProduct)
}

function updateReportButtons(mode, dailyButton, monthlyButton){
if(dailyButton){
dailyButton.className = mode === "daily" ? "primary-btn" : "secondary-btn"
}

if(monthlyButton){
monthlyButton.className = mode === "monthly" ? "primary-btn" : "secondary-btn"
}
}

function renderReportChart(history, mode, topProduct){
const canvas = document.getElementById("reportChart")

if(!canvas) return

const grouped = new Map()

history.forEach((item)=>{
const createdAt = new Date(item.created_at)
const label = mode === "monthly"
? createdAt.toLocaleDateString("th-TH",{ day:"numeric", month:"short" })
: createdAt.toLocaleTimeString("th-TH",{ hour:"2-digit", minute:"2-digit" })

grouped.set(label, (grouped.get(label) || 0) + Number(item.quantity))
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
label:topProduct ? `แนวโน้มการเคลื่อนไหว (${topProduct})` : "แนวโน้มการเคลื่อนไหว",
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
legend:{ display:false }
},
scales:{
y:{
beginAtZero:true,
grid:{ color:"rgba(148,163,184,0.18)" }
},
x:{
grid:{ display:false }
}
}
}
})
}

function renderRecentActivity(history){
const recentList = document.getElementById("reportRecentList")

if(!recentList) return

const items = history.slice(0,4)
recentList.innerHTML = items.length
? items.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">${formatThaiDate(item.created_at)}</span>
<strong>${item.name}</strong>
<span class="recent-meta">จำนวน ${item.quantity} ชิ้น</span>
</div>
<span class="recent-type">${item.type}</span>
</div>
`).join("")
: "<p class='empty-text'>ยังไม่มีข้อมูล</p>"
}

function renderLatestInsight(history){
const latestProduct = document.getElementById("reportLatestProduct")
const latestType = document.getElementById("reportLatestType")
const latestTime = document.getElementById("reportLatestTime")
const latest = history[0]

if(latestProduct){
latestProduct.innerText = latest ? latest.name : "-"
}

if(latestType){
latestType.innerText = latest ? (latest.type === "IN" ? "รับเข้า" : "จ่ายออก") : "-"
}

if(latestTime){
latestTime.innerText = latest ? formatThaiDate(latest.created_at) : "-"
}
}

async function addProduct(){
const name = document.getElementById("name").value.trim()
const stock = Number(document.getElementById("stock").value)
const minStock = Number(document.getElementById("min").value)

if(!name || Number.isNaN(stock) || Number.isNaN(minStock)){
alert("กรุณากรอกข้อมูลสินค้าให้ครบ")
return
}

await apiRequest(PRODUCTS_API,{
method:"POST",
body:JSON.stringify({
name,
stock,
min_stock:minStock
})
})

closeModal()
resetProductForm()
await initializePage()
}

function resetProductForm(){
const fields = ["name","stock","min"]
fields.forEach((fieldId)=>{
const element = document.getElementById(fieldId)
if(element){
element.value = ""
}
})
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
if(!confirm("ต้องการลบสินค้านี้ใช่หรือไม่")){
return
}

await apiRequest(`${PRODUCTS_API}/${id}`,{
method:"DELETE"
})

await initializePage()
}

async function stockIn(id){
const quantity = prompt("จำนวนที่รับเข้า")

if(!quantity) return

await apiRequest(`${PRODUCTS_API}/stockin`,{
method:"POST",
body:JSON.stringify({
id,
quantity:Number(quantity)
})
})

await initializePage()
}

async function stockOut(id){
const quantity = prompt("จำนวนที่จ่ายออก")

if(!quantity) return

await apiRequest(`${PRODUCTS_API}/stockout`,{
method:"POST",
body:JSON.stringify({
id,
quantity:Number(quantity)
})
})

await initializePage()
}

function searchProduct(){
const input = document.getElementById("search")
if(!input) return

const keyword = input.value.toLowerCase()
const rows = document.querySelectorAll("#productTable tr")

rows.forEach((row)=>{
const nameCell = row.children[1]
if(!nameCell) return

row.style.display = nameCell.innerText.toLowerCase().includes(keyword) ? "" : "none"
})
}

async function dailyReport(){
const history = await fetchHistory()
renderReport(history,"daily")
}

async function monthlyReport(){
const history = await fetchHistory()
renderReport(history,"monthly")
}

function logout(){
localStorage.removeItem("token")
localStorage.removeItem("username")
localStorage.removeItem("role")
window.location.href = "login.html"
}

function handleUnexpectedError(error){
console.error(error)

if(error.message !== "Session expired"){
alert(error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด")
}
}

function sumQuantities(items){
return items.reduce((sum, item)=>sum + Number(item.quantity), 0)
}

function findTopProduct(history){
if(!history.length) return ""

const totals = {}
history.forEach((item)=>{
totals[item.name] = (totals[item.name] || 0) + Number(item.quantity)
})

return Object.entries(totals).sort((a,b)=>b[1] - a[1])[0][0]
}

function findExtremeProduct(products, mode){
if(!products.length) return "-"

const sorted = [...products].sort((a,b)=>mode === "max" ? b.stock - a.stock : a.stock - b.stock)
const product = sorted[0]

return `${product.name} (${product.stock} ชิ้น)`
}

function calculateAverageStock(products){
if(!products.length) return 0

const total = products.reduce((sum, product)=>sum + Number(product.stock), 0)
return Math.round(total / products.length)
}

function formatThaiDate(dateString){
const date = new Date(dateString)

return new Intl.DateTimeFormat("th-TH",{
year:"numeric",
month:"short",
day:"numeric",
hour:"2-digit",
minute:"2-digit"
}).format(date)
}

function getLocalDateKey(date){
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2,"0")
const day = String(date.getDate()).padStart(2,"0")

return `${year}-${month}-${day}`
}
