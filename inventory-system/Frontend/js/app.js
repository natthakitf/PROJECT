const App = (() => {
  const API_BASE = window.location.origin
  const PRODUCTS_API = `${API_BASE}/products`

  function getToken() {
    return localStorage.getItem("token")
  }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = "login.html"
      return false
    }

    return true
  }

  function renderUsername() {
    const usernameDisplay = document.getElementById("usernameDisplay")
    const username = localStorage.getItem("username")

    if (usernameDisplay && username) {
      usernameDisplay.innerText = username
    }
  }

  async function apiRequest(url, options = {}) {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`
    }

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    const contentType = response.headers.get("content-type") || ""
    const payload = contentType.includes("application/json")
      ? await response.json()
      : null

    if (response.status === 401) {
      logout()
      throw new Error("Session expired")
    }

    if (!response.ok) {
      throw new Error(payload?.message || "Request failed")
    }

    return payload
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("role")
    window.location.href = "login.html"
  }

  function handleUnexpectedError(error) {
    console.error(error)

    if (error.message !== "Session expired") {
      alert(error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด")
    }
  }

  function formatThaiDate(dateString) {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString))
  }

  function findTopProduct(history) {
    if (!history.length) {
      return ""
    }

    const totals = {}

    history.forEach((item) => {
      totals[item.name] = (totals[item.name] || 0) + Number(item.quantity)
    })

    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]
  }

  function sumQuantities(items) {
    return items.reduce((sum, item) => sum + Number(item.quantity), 0)
  }

  function getLocalDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  return {
    API_BASE,
    PRODUCTS_API,
    requireAuth,
    renderUsername,
    apiRequest,
    logout,
    handleUnexpectedError,
    formatThaiDate,
    findTopProduct,
    sumQuantities,
    getLocalDateKey
  }
})()

window.logout = App.logout
