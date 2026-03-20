const express = require("express")
const cors = require("cors")
const path = require("path")

const config = require("./config")
const { bootstrapDatabase } = require("./database/bootstrap")
const auth = require("./routes/auth")
const products = require("./routes/products")

const app = express()
const loginPage = path.join(config.publicDir, "login.html")
const dashboardPage = path.join(config.publicDir, "index.html")

app.use(cors({
  origin: config.clientOrigin === "*" ? true : config.clientOrigin
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/health", (req, res) => {
  res.json({ message: "ok" })
})

app.use("/auth", auth)
app.use("/products", products)
app.use(express.static(config.publicDir))

app.get("/", (req, res) => {
  res.sendFile(loginPage)
})

app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(loginPage)
})

app.get(["/dashboard", "/index.html"], (req, res) => {
  res.sendFile(dashboardPage)
})

app.get("/products.html", (req, res) => {
  res.sendFile(path.join(config.publicDir, "products.html"))
})

app.get("/history.html", (req, res) => {
  res.sendFile(path.join(config.publicDir, "history.html"))
})

app.get("/report.html", (req, res) => {
  res.sendFile(path.join(config.publicDir, "report.html"))
})

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ message: "Internal server error" })
})

async function startServer() {
  try {
    await bootstrapDatabase()

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })
  } catch (err) {
    console.error("Failed to start server:", err)
    process.exit(1)
  }
}

startServer()
