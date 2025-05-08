const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối khi khởi động
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Đã kết nối thành công với MySQL/XAMPP');
    connection.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;