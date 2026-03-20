let reportChart

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("report")) return
  if (!App.requireAuth()) return

  loadReportPage().catch(App.handleUnexpectedError)
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

async function loadReportPage() {
  const history = await App.apiRequest(`${App.PRODUCTS_API}/history`)
  renderRecentActivity(history)
  renderLatestInsight(history)
  renderReport(history, "daily")
}

function renderReport(history, mode) {
  const reportText = document.getElementById("report")
  const totalMoves = document.getElementById("reportTotalMoves")
  const stockIn = document.getElementById("reportStockIn")
  const stockOut = document.getElementById("reportStockOut")
  const rangeLabel = document.getElementById("reportRangeLabel")
  const badge = document.getElementById("reportBadge")

  if (!reportText || !totalMoves || !stockIn || !stockOut || !rangeLabel || !badge) {
    return
  }

  const filteredHistory = getReportHistory(history, mode)
  const totalQuantity = App.sumQuantities(filteredHistory)
  const stockInQuantity = App.sumQuantities(filteredHistory.filter((item) => item.type === "IN"))
  const stockOutQuantity = App.sumQuantities(filteredHistory.filter((item) => item.type === "OUT"))
  const topProduct = App.findTopProduct(filteredHistory)

  reportText.innerText = mode === "monthly"
    ? `รายงานเดือนนี้: มีการเคลื่อนไหวสินค้า ${totalQuantity} ชิ้น`
    : `รายงานวันนี้: มีการเคลื่อนไหวสินค้า ${totalQuantity} ชิ้น`

  totalMoves.innerText = totalQuantity
  stockIn.innerText = stockInQuantity
  stockOut.innerText = stockOutQuantity
  rangeLabel.innerText = mode === "monthly" ? "ข้อมูลเดือนปัจจุบัน" : "ข้อมูลวันนี้"
  badge.innerText = mode === "monthly" ? "เดือนนี้" : "วันนี้"

  updateReportButtons(mode)
  renderReportChart(filteredHistory, mode, topProduct)
}

function getReportHistory(history, mode) {
  const now = new Date()
  const todayKey = App.getLocalDateKey(now)

  return history.filter((item) => {
    const createdAt = new Date(item.created_at)

    if (mode === "monthly") {
      return createdAt.getFullYear() === now.getFullYear()
        && createdAt.getMonth() === now.getMonth()
    }

    return App.getLocalDateKey(createdAt) === todayKey
  })
}

function updateReportButtons(mode) {
  const dailyButton = document.getElementById("dailyReportBtn")
  const monthlyButton = document.getElementById("monthlyReportBtn")

  if (dailyButton) {
    dailyButton.className = mode === "daily" ? "primary-btn" : "secondary-btn"
  }

  if (monthlyButton) {
    monthlyButton.className = mode === "monthly" ? "primary-btn" : "secondary-btn"
  }
}

function renderReportChart(history, mode, topProduct) {
  const canvas = document.getElementById("reportChart")

  if (!canvas) return

  const { labels, values } = groupHistoryForChart(history, mode)
  const chartLabels = labels.length ? labels : ["ไม่มีข้อมูล"]
  const chartValues = values.length ? values : [0]

  if (reportChart) {
    reportChart.destroy()
  }

  reportChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: topProduct ? `แนวโน้มการเคลื่อนไหว (${topProduct})` : "แนวโน้มการเคลื่อนไหว",
          data: chartValues,
          borderColor: "#111827",
          backgroundColor: "rgba(17,24,39,0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#111827"
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(148,163,184,0.18)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

function groupHistoryForChart(history, mode) {
  const grouped = new Map()

  history.forEach((item) => {
    const createdAt = new Date(item.created_at)
    const label = mode === "monthly"
      ? createdAt.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
      : createdAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })

    grouped.set(label, (grouped.get(label) || 0) + Number(item.quantity))
  })

  return {
    labels: Array.from(grouped.keys()),
    values: Array.from(grouped.values())
  }
}

function renderRecentActivity(history) {
  const recentList = document.getElementById("reportRecentList")

  if (!recentList) return

  const items = history.slice(0, 4)

  recentList.innerHTML = items.length
    ? items.map((item) => `
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

function renderLatestInsight(history) {
  const latestItem = history[0]

  setText("reportLatestProduct", latestItem ? latestItem.name : "-")
  setText("reportLatestType", latestItem ? getTypeText(latestItem.type) : "-")
  setText("reportLatestTime", latestItem ? App.formatThaiDate(latestItem.created_at) : "-")
}

async function dailyReport() {
  const history = await App.apiRequest(`${App.PRODUCTS_API}/history`)
  renderReport(history, "daily")
}

async function monthlyReport() {
  const history = await App.apiRequest(`${App.PRODUCTS_API}/history`)
  renderReport(history, "monthly")
}

window.dailyReport = dailyReport
window.monthlyReport = monthlyReport
