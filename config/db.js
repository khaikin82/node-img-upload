const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "34.173.83.207",
  user: "cruduser",
  password: "crudpass",
  database: "node_crud",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("MySQL Connected!");

  // Tạo bảng nếu chưa có
  const createTable = `
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createTable, (err) => {
    if (err) throw err;
    console.log("Table ready.");
  });
});

module.exports = db;
