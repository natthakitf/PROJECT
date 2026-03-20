let inventoryChart
let dashboardProducts = []

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("productChart")) return
  if (!App.requireAuth()) return

  App.renderUsername()
  loadDashboard().catch(App.handleUnexpectedError)
})

async function loadDashboard() {
  dashboardProducts = await App.apiRequest(App.PRODUCTS_API)
  applyDashboardFilter("")
}

function applyDashboardFilter(keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const filteredProducts = normalizedKeyword
    ? dashboardProducts.filter((product) => {
      return product.name.toLowerCase().includes(normalizedKeyword)
    })
    : dashboardProducts

  renderDashboardSummary(filteredProducts, normalizedKeyword)
  renderProductChart(filteredProducts)
}

function renderDashboardSummary(products, keyword = "") {
  const totalProducts = document.getElementById("totalProducts")
  const lowStock = document.getElementById("lowStock")
  const lowStockAlert = document.getElementById("lowStockAlert")
  const lowProducts = products.filter((product) => product.stock <= product.min_stock)

  if (totalProducts) {
    totalProducts.innerText = products.length
  }

  if (lowStock) {
    lowStock.innerText = lowProducts.length
  }

  if (!lowStockAlert) return

  if (!products.length && keyword) {
    lowStockAlert.innerHTML = "<div class='alertItem'>ไม่พบสินค้าที่ตรงกับคำค้น</div>"
    return
  }

  lowStockAlert.innerHTML = lowProducts.length
    ? lowProducts.map((product) => {
      return `<div class="alertItem">สินค้า ${product.name} ใกล้หมด</div>`
    }).join("")
    : "<div class='alertItem'>ไม่พบสินค้าใกล้หมดตามคำค้น</div>"
}

function renderProductChart(products) {
  const canvas = document.getElementById("productChart")

  if (!canvas) return

  const labels = products.length ? products.map((product) => product.name) : ["ไม่พบข้อมูล"]
  const values = products.length ? products.map((product) => product.stock) : [0]

  if (inventoryChart) {
    inventoryChart.destroy()
  }

  inventoryChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "จำนวนสินค้า",
          data: values,
          backgroundColor: "#111827",
          borderRadius: 10
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

function searchProduct() {
  const input = document.getElementById("search")

  if (!input) return

  applyDashboardFilter(input.value)
}

window.searchProduct = searchProduct
