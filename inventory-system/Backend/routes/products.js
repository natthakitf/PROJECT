const express = require("express")

const db = require("../db")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

router.use(requireAuth)

function parseId(value) {
  const parsedId = Number(value)
  return Number.isNaN(parsedId) ? null : parsedId
}

function parsePositiveNumber(value) {
  const parsedValue = Number(value)
  return Number.isNaN(parsedValue) || parsedValue <= 0 ? null : parsedValue
}

function sendError(res, status, message) {
  return res.status(status).json({ message })
}

async function findProductById(productId, includeStock = false) {
  const query = includeStock
    ? "SELECT id, stock FROM products WHERE id=? LIMIT 1"
    : "SELECT id FROM products WHERE id=? LIMIT 1"

  const [rows] = await db.query(query, [productId])
  return rows[0] || null
}

async function addStockHistory(productId, type, quantity) {
  await db.query(
    "INSERT INTO stock_history(product_id,type,quantity) VALUES(?,?,?)",
    [productId, type, quantity]
  )
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, stock, min_stock FROM products ORDER BY id ASC"
    )

    res.status(200).json(rows)
  } catch (err) {
    console.error("Get products error:", err)
    sendError(res, 500, "Unable to fetch products")
  }
})

router.post("/", async (req, res) => {
  const { name, stock, min_stock: minStock } = req.body
  const productName = name?.trim()
  const parsedStock = Number(stock)
  const parsedMinStock = Number(minStock)

  if (!productName || Number.isNaN(parsedStock) || Number.isNaN(parsedMinStock)) {
    return sendError(res, 400, "Name, stock and min stock are required")
  }

  if (parsedStock < 0 || parsedMinStock < 0) {
    return sendError(res, 400, "Stock values must be zero or greater")
  }

  try {
    const [result] = await db.query(
      "INSERT INTO products(name,stock,min_stock) VALUES(?,?,?)",
      [productName, parsedStock, parsedMinStock]
    )

    res.status(201).json({
      message: "Product created",
      id: result.insertId
    })
  } catch (err) {
    console.error("Create product error:", err)
    sendError(res, 500, "Unable to create product")
  }
})

router.delete("/:id", async (req, res) => {
  const productId = parseId(req.params.id)

  if (!productId) {
    return sendError(res, 400, "Invalid product id")
  }

  try {
    const [result] = await db.query("DELETE FROM products WHERE id=?", [productId])

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Product not found")
    }

    res.status(200).json({ message: "Product deleted" })
  } catch (err) {
    console.error("Delete product error:", err)
    sendError(res, 500, "Unable to delete product")
  }
})

router.post("/stockin", async (req, res) => {
  const productId = parseId(req.body.id)
  const quantity = parsePositiveNumber(req.body.quantity)

  if (!productId || !quantity) {
    return sendError(res, 400, "Valid product id and positive quantity are required")
  }

  try {
    const product = await findProductById(productId)

    if (!product) {
      return sendError(res, 404, "Product not found")
    }

    await db.query("UPDATE products SET stock=stock+? WHERE id=?", [quantity, productId])
    await addStockHistory(productId, "IN", quantity)

    res.status(200).json({ message: "Stock added" })
  } catch (err) {
    console.error("Stock in error:", err)
    sendError(res, 500, "Unable to increase stock")
  }
})

router.post("/stockout", async (req, res) => {
  const productId = parseId(req.body.id)
  const quantity = parsePositiveNumber(req.body.quantity)

  if (!productId || !quantity) {
    return sendError(res, 400, "Valid product id and positive quantity are required")
  }

  try {
    const product = await findProductById(productId, true)

    if (!product) {
      return sendError(res, 404, "Product not found")
    }

    if (product.stock < quantity) {
      return sendError(res, 400, "Insufficient stock")
    }

    await db.query("UPDATE products SET stock=stock-? WHERE id=?", [quantity, productId])
    await addStockHistory(productId, "OUT", quantity)

    res.status(200).json({ message: "Stock removed" })
  } catch (err) {
    console.error("Stock out error:", err)
    sendError(res, 500, "Unable to decrease stock")
  }
})

router.get("/history", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        stock_history.id,
        stock_history.product_id,
        stock_history.type,
        stock_history.quantity,
        DATE_FORMAT(
          CONVERT_TZ(stock_history.created_at, '+00:00', '+07:00'),
          '%Y-%m-%d %H:%i:%s'
        ) AS created_at,
        products.name
      FROM stock_history
      JOIN products ON products.id = stock_history.product_id
      ORDER BY created_at DESC
    `)

    res.status(200).json(rows)
  } catch (err) {
    console.error("Get history error:", err)
    sendError(res, 500, "Unable to fetch stock history")
  }
})

module.exports = router
