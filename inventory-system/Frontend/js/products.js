document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("productTable")) return
  if (!App.requireAuth()) return

  loadProductsPage().catch(App.handleUnexpectedError)
})

async function loadProductsPage() {
  const products = await fetchProducts()
  renderProductsTable(products)
  renderProductsDashboard(products)
}

async function fetchProducts() {
  setProductsLoading("กำลังโหลดข้อมูลสินค้า...")
  return App.apiRequest(App.PRODUCTS_API)
}

function setProductsLoading(message) {
  const table = document.getElementById("productTable")

  if (table) {
    table.innerHTML = `<tr><td colspan="5">${message}</td></tr>`
  }
}

function renderProductsTable(products) {
  const table = document.getElementById("productTable")

  if (!table) return

  if (!products.length) {
    table.innerHTML = "<tr><td colspan='5'>ยังไม่มีสินค้าในระบบ</td></tr>"
    return
  }

  table.innerHTML = products.map(renderProductRow).join("")
}

function renderProductRow(product) {
  return `
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
`
}

function renderProductsDashboard(products) {
  const totalCount = document.getElementById("productsTotalCount")
  const lowCount = document.getElementById("productsLowCount")
  const healthyCount = document.getElementById("productsHealthyCount")
  const statusList = document.getElementById("productsStatusList")
  const watchList = document.getElementById("productsWatchList")
  const lastUpdated = document.getElementById("productsLastUpdated")
  const lowProducts = products.filter((item) => item.stock <= item.min_stock)

  if (totalCount) {
    totalCount.innerText = products.length
  }

  if (lowCount) {
    lowCount.innerText = lowProducts.length
  }

  if (healthyCount) {
    healthyCount.innerText = products.length - lowProducts.length
  }

  if (lastUpdated) {
    lastUpdated.innerText = `อัปเดต ${new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    })}`
  }

  if (statusList) {
    const summaryItems = [
      { label: "สินค้ามากที่สุด", value: findExtremeProduct(products, "max") },
      { label: "สินค้าน้อยที่สุด", value: findExtremeProduct(products, "min") },
      { label: "ค่าเฉลี่ยคงเหลือ", value: `${calculateAverageStock(products)} ชิ้น` }
    ]

    statusList.innerHTML = summaryItems.map((item) => `
<div class="insight-item">
<span class="insight-label">${item.label}</span>
<strong>${item.value}</strong>
</div>
`).join("")
  }

  if (watchList) {
    watchList.innerHTML = lowProducts.length
      ? lowProducts.map((item) => `
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

function findExtremeProduct(products, mode) {
  if (!products.length) return "-"

  const sortedProducts = [...products].sort((a, b) => {
    return mode === "max" ? b.stock - a.stock : a.stock - b.stock
  })

  const selectedProduct = sortedProducts[0]
  return `${selectedProduct.name} (${selectedProduct.stock} ชิ้น)`
}

function calculateAverageStock(products) {
  if (!products.length) return 0

  const total = products.reduce((sum, product) => sum + Number(product.stock), 0)
  return Math.round(total / products.length)
}

async function addProduct() {
  const name = document.getElementById("name").value.trim()
  const stock = Number(document.getElementById("stock").value)
  const minStock = Number(document.getElementById("min").value)

  if (!name || Number.isNaN(stock) || Number.isNaN(minStock)) {
    alert("กรุณากรอกข้อมูลสินค้าให้ครบ")
    return
  }

  await App.apiRequest(App.PRODUCTS_API, {
    method: "POST",
    body: JSON.stringify({
      name,
      stock,
      min_stock: minStock
    })
  })

  closeModal()
  resetProductForm()
  await loadProductsPage()
}

function resetProductForm() {
  const fieldIds = ["name", "stock", "min"]

  fieldIds.forEach((fieldId) => {
    const element = document.getElementById(fieldId)

    if (element) {
      element.value = ""
    }
  })
}

function openModal() {
  toggleModal(true)
}

function closeModal() {
  toggleModal(false)
}

function toggleModal(isVisible) {
  const modal = document.getElementById("productModal")

  if (modal) {
    modal.style.display = isVisible ? "flex" : "none"
  }
}

async function deleteProduct(id) {
  if (!confirm("ต้องการลบสินค้านี้ใช่หรือไม่")) {
    return
  }

  await App.apiRequest(`${App.PRODUCTS_API}/${id}`, {
    method: "DELETE"
  })

  await loadProductsPage()
}

async function stockIn(id) {
  await updateStock(id, "stockin", "จำนวนที่รับเข้า")
}

async function stockOut(id) {
  await updateStock(id, "stockout", "จำนวนที่จ่ายออก")
}

async function updateStock(id, action, message) {
  const quantity = prompt(message)

  if (!quantity) return

  await App.apiRequest(`${App.PRODUCTS_API}/${action}`, {
    method: "POST",
    body: JSON.stringify({
      id,
      quantity: Number(quantity)
    })
  })

  await loadProductsPage()
}

window.openModal = openModal
window.closeModal = closeModal
window.addProduct = addProduct
window.deleteProduct = deleteProduct
window.stockIn = stockIn
window.stockOut = stockOut
