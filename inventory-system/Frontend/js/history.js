document.addEventListener("DOMContentLoaded",()=>{
if(!document.getElementById("historyTable")) return
if(!App.requireAuth()) return

loadHistoryPage().catch(App.handleUnexpectedError)
})

async function loadHistoryPage(){
const history = await fetchHistory()
renderHistoryTable(history)
renderHistoryDashboard(history)
}

async function fetchHistory(){
setHistoryLoading("กำลังโหลดประวัติ...")
return App.apiRequest(`${App.PRODUCTS_API}/history`)
}

function setHistoryLoading(message){
const table = document.getElementById("historyTable")

if(table){
table.innerHTML = `<tr><td colspan="4">${message}</td></tr>`
}
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
<td>${App.formatThaiDate(item.created_at)}</td>
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
latestTime.innerText = latest ? App.formatThaiDate(latest.created_at) : "ไม่มีข้อมูล"
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
const items = history.slice(0, 3)
recentList.innerHTML = items.length
? items.map((item)=>`
<div class="recent-item">
<div>
<span class="recent-meta">${App.formatThaiDate(item.created_at)}</span>
<strong>${item.name}</strong>
<span class="recent-meta">จำนวน ${item.quantity} ชิ้น</span>
</div>
<span class="recent-type">${item.type}</span>
</div>
`).join("")
: "<p class='empty-text'>ยังไม่มีข้อมูล</p>"
}
}
