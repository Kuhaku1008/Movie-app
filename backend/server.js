require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Backend đang hoạt động!');
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không tìm thấy token.' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
    req.user = user;
    next();
  });
};

const authAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') next();
  else res.status(403).json({ message: 'Không có quyền truy cập.' });
};

// Đăng ký người dùng
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Tên người dùng và mật khẩu là bắt buộc.' });
  }

  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Tên người dùng đã tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'user']);
    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
});

// Đăng nhập người dùng
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Tên người dùng và mật khẩu là bắt buộc.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Tên người dùng hoặc mật khẩu không đúng.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Tên người dùng hoặc mật khẩu không đúng.' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Đăng nhập thành công.', user: { id: user.id, username: user.username, role: user.role, token: accessToken } });
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
});

// Lấy danh sách tất cả phim 
app.get('/api/movies', async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const [movies] = await db.query(
      `SELECT * FROM movies WHERE title LIKE ? LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );

    const [countRows] = await db.query(
      'SELECT COUNT(*) AS total FROM movies WHERE title LIKE ?', [`%${search}%`]
    );
    const total = countRows[0].total;

    res.json({
      movies,
      total,
      page,
      last_page: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Lỗi khi tìm kiếm phim:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm phim.' });
  }
});



// Lấy chi tiết phim theo ID
app.get('/api/movies/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phim.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết phim:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phim.' });
  }
});


// Lấy phim yêu thích của người dùng
app.get('/api/user/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [favorites] = await db.query(
      `SELECT m.* FROM movies m
       JOIN favorite_movies fm ON m.id = fm.movie_id
       WHERE fm.user_id = ?`,
      [userId]
    );
    res.json(favorites);
  } catch (err) {
    console.error('Lỗi khi lấy phim yêu thích:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy phim yêu thích.' });
  }
});

// Thêm phim vào danh sách yêu thích
app.post('/api/user/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: 'ID phim là bắt buộc.' });
  }

  try {
    const [existingFavorite] = await db.query(
      'SELECT * FROM favorite_movies WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existingFavorite.length > 0) {
      return res.status(409).json({ message: 'Phim đã có trong danh sách yêu thích.' });
    }

    await db.query('INSERT INTO favorite_movies (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
    res.status(201).json({ message: 'Thêm vào yêu thích thành công.' });
  } catch (err) {
    console.error('Lỗi khi thêm vào yêu thích:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm vào yêu thích.' });
  }
});

// Xóa phim khỏi danh sách yêu thích
app.delete('/api/user/favorites/:movieId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM favorite_movies WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Phim không có trong danh sách yêu thích của bạn.' });
    }

    res.json({ message: 'Xóa khỏi yêu thích thành công.' });
  } catch (err) {
    console.error('Lỗi khi xóa khỏi yêu thích:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa khỏi yêu thích.' });
  }
});

// Kiểm tra trạng thái yêu thích của phim
app.get('/api/user/favorites/status/:movieId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM favorite_movies WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    const isFavorited = rows[0].count > 0;
    res.json({ isFavorited });
  } catch (err) {
    console.error('Lỗi khi kiểm tra trạng thái yêu thích:', err);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái yêu thích.' });
  }
});


// Admin: Lấy danh sách tất cả người dùng
app.get('/api/admin/users', authenticateToken, authAdmin, async (req, res) => {
  try {
    const search = req.query.search;
    let query = 'SELECT id, username, role FROM users';
    let params = [];

    if (search) {
      query += ' WHERE username LIKE ?';
      params.push(`%${search}%`);
    }

    const [users] = await db.query(query, params);
    res.json(users);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy người dùng.' });
  }
});


// Admin: Cập nhật vai trò người dùng
app.put('/api/admin/users/:id', authenticateToken, authAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });

  const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  res.json({ message: 'Cập nhật vai trò thành công.' });
});

// Admin: Xóa người dùng
app.delete('/api/admin/users/:id', authenticateToken, authAdmin, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  res.json({ message: 'Xóa người dùng thành công.' });
});


// Public: Tìm kiếm phim từ TMDB (không cần đăng nhập)
app.get('/api/public/tmdb/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Từ khóa tìm kiếm là bắt buộc.' });
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: 'vi-VN',
      },
    });
    res.json(response.data.results);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm phim trên TMDB:', error.message);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm phim từ TMDB.' });
  }
});


// Public: Lấy chi tiết phim từ TMDB bằng TMDB ID (không cần đăng nhập)
app.get('/api/public/tmdb/movie/:tmdbId', async (req, res) => {
  const { tmdbId } = req.params;
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'vi-VN',
        append_to_response: 'credits,videos'
      },
    });

    const movieData = response.data;

    const formattedMovie = {
      tmdb_id: movieData.id,
      title: movieData.title,
      original_title: movieData.original_title,
      overview: movieData.overview,
      release_date: movieData.release_date,
      poster_path: movieData.poster_path,
      backdrop_path: movieData.backdrop_path,
      vote_average: movieData.vote_average,
      vote_count: movieData.vote_count,
      popularity: movieData.popularity,
      runtime: movieData.runtime,
      genres: movieData.genres.map(g => ({ id: g.id, name: g.name })), 
      director: movieData.credits.crew.find(person => person.job === 'Director')?.name || '',
      cast: movieData.credits.cast.slice(0, 5).map(c => ({ name: c.name, character: c.character })),
      trailer_key: movieData.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key || '',
      watch_url: '' 
    };

    res.json(formattedMovie);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phim từ TMDB:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết phim từ TMDB.' });
  }
});


// Admin: Lấy danh sách tất cả phim 
app.get('/api/admin/movies', authenticateToken, authAdmin, async (req, res) => {
  try {
    const [movies] = await db.query('SELECT * FROM movies');
    res.json(movies);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phim cho admin:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phim cho admin.' });
  }
});
app.get('/api/public/movies/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim trong database của bạn.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Lỗi khi lấy chi tiết phim từ DB (public):', err);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phim từ DB.' });
    }
});


// Admin: Thêm phim mới
app.post('/api/admin/movies', authenticateToken, authAdmin, async (req, res) => {
  const {
    tmdb_id, title, original_title, overview, release_date, poster_path,
    backdrop_path, vote_average, vote_count, popularity, runtime,
    genres, director, cast, trailer_key, watch_url
  } = req.body;

  if (!tmdb_id || !title || !overview || !release_date || !poster_path) {
    return res.status(400).json({ message: 'Thiếu thông tin phim cần thiết.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO movies (tmdb_id, title, original_title, overview, release_date, poster_path, backdrop_path, vote_average, vote_count, popularity, runtime, genres, director, cast, trailer_key, watch_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        tmdb_id, title, original_title, overview, release_date, poster_path, backdrop_path,
        vote_average, vote_count, popularity, runtime,
        JSON.stringify(genres), 
        director,
        JSON.stringify(cast),   
        trailer_key, watch_url
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Thêm phim thành công.' });
  } catch (err) {
    console.error('Lỗi khi thêm phim:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm phim.', error: err.message });
  }
});


// Admin: Cập nhật thông tin phim
app.put('/api/admin/movies/:id', authenticateToken, authAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    tmdb_id, title, original_title, overview, release_date, poster_path,
    backdrop_path, vote_average, vote_count, popularity, runtime,
    genres, director, cast, trailer_key, watch_url
  } = req.body;

  if (!tmdb_id || !title || !overview || !release_date || !poster_path) {
    return res.status(400).json({ message: 'Thiếu thông tin phim cần thiết để cập nhật.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE movies SET tmdb_id = ?, title = ?, original_title = ?, overview = ?, release_date = ?, poster_path = ?, backdrop_path = ?, vote_average = ?, vote_count = ?, popularity = ?, runtime = ?, genres = ?, director = ?, cast = ?, trailer_key = ?, watch_url = ? WHERE id = ?',
      [
        tmdb_id, title, original_title, overview, release_date, poster_path, backdrop_path,
        vote_average, vote_count, popularity, runtime,
        JSON.stringify(genres), 
        director,
        JSON.stringify(cast),   
        trailer_key, watch_url,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phim để cập nhật.' });
    }

    res.json({ message: 'Cập nhật phim thành công.' });
  } catch (err) {
    console.error('Lỗi khi cập nhật phim:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật phim.', error: err.message });
  }
});
// Xóa phim (chỉ admin)
app.delete('/api/admin/movies/:id', authenticateToken, authAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM movies WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim để xóa.' });
        }
        res.status(200).json({ message: 'Xóa phim thành công.' });
    } catch (error) {
        console.error('Lỗi khi xóa phim:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa phim.' });
    }
});
app.get('/api/user/info', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin người dùng:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});
app.put('/api/user/update', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { username, password } = req.body;

  if (!username && !password) {
    return res.status(400).json({ message: 'Cần có ít nhất username hoặc password để cập nhật.' });
  }

  try {
    if (username) {
      await db.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    }

    res.json({ message: 'Cập nhật thông tin thành công.' });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật.' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});