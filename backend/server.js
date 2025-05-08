require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt'); // Thêm bcrypt để hash mật khẩu

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Backend đang hoạt động!');
});

// Route đăng ký
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra email đã tồn tại chưa
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // 2. Mã hóa password trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10); // 10 là salt rounds

        // 3. Tạo user mới
        const [result] = await db.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // 4. Trả về response
        res.status(201).json({
            message: 'Đăng ký thành công',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Route đăng nhập
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Tìm user theo email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email không tồn tại' }); // 401 Unauthorized
        }

        const user = users[0];

        // 2. So sánh password đã nhập với password đã mã hóa trong database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        // 3. Nếu mọi thứ đều đúng, trả về thông tin đăng nhập thành công
        res.status(200).json({ message: 'Đăng nhập thành công', userId: user.id }); // Không trả về password!

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên http://localhost:${PORT}`);
});