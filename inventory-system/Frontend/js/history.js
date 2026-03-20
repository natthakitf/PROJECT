document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("historyTable")) return
  if (!App.requireAuth()) return

  loadHistoryPage().catch(App.handleUnexpectedError)
})

function getTypeText(type) {
  return type === "IN" ? "รับเข้า" : "จ่ายออก"
}

function setText(id, value) {
  const element = document.getElementById(id)

  if (element) {
    element.innerText = value
  }
}

async function loadHistoryPage() {
  const history = await fetchHistory()
  renderHistoryTable(history)
  renderHistoryDashboard(history)
}

async function fetchHistory() {
  setHistoryLoading("กำลังโหลดประวัติ...")
  return App.apiRequest(`${App.PRODUCTS_API}/history`)
}

function setHistoryLoading(message) {
  const table = document.getElementById("historyTable")

  if (table) {
    table.innerHTML = `<tr><td colspan="4">${message}</td></tr>`
  }
}

function renderHistoryTable(history) {
  const table = document.getElementById("historyTable")

  if (!table) return

  if (!history.length) {
    table.innerHTML = "<tr><td colspan='4'>ยังไม่มีประวัติการเคลื่อนไหว</td></tr>"
    return
  }

  table.innerHTML = history.map((item) => `
<tr>
<td>${item.name}</td>
<td>${getTypeText(item.type)}</td>
<td>${item.quantity}</td>
<td>${App.formatThaiDate(item.created_at)}</td>
</tr>
`).join("")
}

function renderHistoryDashboard(history) {
  const latestItem = history[0]
  const recentList = document.getElementById("historyRecentList")
  const inItems = history.filter((item) => item.type === "IN")
  const outItems = history.filter((item) => item.type === "OUT")

  setText("historyTotalCount", history.length)
  setText("historyInCount", inItems.length)
  setText("historyOutCount", outItems.length)
  setText("historyLatestTime", latestItem ? App.formatThaiDate(latestItem.created_at) : "ไม่มีข้อมูล")
  setText("historyLatestProduct", latestItem ? latestItem.name : "-")
  setText("historyLatestType", latestItem ? getTypeText(latestItem.type) : "-")
  setText("historyLatestQuantity", latestItem ? `${latestItem.quantity} ชิ้น` : "-")

  if (!recentList) return

  const recentItems = history.slice(0, 3)

  recentList.innerHTML = recentItems.length
    ? recentItems.map((item) => `
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
