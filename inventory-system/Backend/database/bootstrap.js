const db = require("../db")
const { hashPassword } = require("../utils/password")

const defaultAdminHash = "bd4e1189e442097d79c556973529772c:38d57a1869e46b623e2f689c6e6a2b8d787b74572cc8c160fb68503f1a91231f7e5f7173e15918e7d925f5f41802c442c8ac48c7eabc1176c013726399fb4b0b"

async function bootstrapDatabase() {
    await createTables()
    await ensureUsersTable()
    await ensureProductsTable()
    await ensureConstraints()
    await ensureAdminUser()
}

async function createTables() {
    await db.query(`
CREATE TABLE IF NOT EXISTS users(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL,
password_hash VARCHAR(255) NULL,
role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)

    await db.query(`
CREATE TABLE IF NOT EXISTS products(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
stock INT NOT NULL DEFAULT 0,
min_stock INT NOT NULL DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)

    await db.query(`
CREATE TABLE IF NOT EXISTS stock_history(
id INT AUTO_INCREMENT PRIMARY KEY,
product_id INT NOT NULL,
type ENUM('IN','OUT') NOT NULL,
quantity INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)
}

async function ensureUsersTable() {
    const [columns] = await db.query("SHOW COLUMNS FROM users")
    const columnNames = columns.map((column) => column.Field)

    if (!columnNames.includes("password_hash")) {
        await db.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL")
    }

    if (!columnNames.includes("created_at")) {
        await db.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    }

    if (columnNames.includes("password")) {
        await movePasswordToHash()
    }
}

async function movePasswordToHash() {
    const [users] = await db.query("SELECT id, password, password_hash FROM users")

    for (const user of users) {
        if (user.password_hash || !user.password) {
            continue
        }

        await db.query(
            "UPDATE users SET password_hash=? WHERE id=?",
            [hashPassword(user.password), user.id]
        )
    }
}

async function ensureProductsTable() {
    const [columns] = await db.query("SHOW COLUMNS FROM products")
    const columnNames = columns.map((column) => column.Field)

    if (!columnNames.includes("created_at")) {
        await db.query("ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    }
}

async function ensureAdminUser() {
    const [rows] = await db.query(
        "SELECT id FROM users WHERE username=? LIMIT 1",
        ["admin"]
    )

    if (rows.length > 0) {
        return
    }

    await db.query(
        "INSERT INTO users(username,password_hash,role) VALUES(?,?,?)",
        ["admin", defaultAdminHash, "admin"]
    )
}

async function ensureConstraints() {
    await ensureUsernameIsUnique()
    await ensureStockHistoryForeignKey()
}

async function ensureUsernameIsUnique() {
    const [rows] = await db.query("SHOW INDEX FROM users WHERE Key_name='uniq_users_username'")

    if (rows.length > 0) {
        return
    }

    try {
        await db.query("ALTER TABLE users ADD CONSTRAINT uniq_users_username UNIQUE (username)")
    } catch (error) {
        console.warn("Skipping unique username constraint:", error.message)
    }
}

async function ensureStockHistoryForeignKey() {
    const [rows] = await db.query(`
SELECT CONSTRAINT_NAME
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'stock_history'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
`)

    if (rows.length > 0) {
        return
    }

    try {
        await db.query(`
ALTER TABLE stock_history
ADD CONSTRAINT fk_stock_history_product
FOREIGN KEY (product_id) REFERENCES products(id)
ON DELETE CASCADE
`)
    } catch (error) {
        console.warn("Skipping stock_history foreign key:", error.message)
    }
}

module.exports = {
    bootstrapDatabase
}
