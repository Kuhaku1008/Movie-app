import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import MovieDetail from './components/MovieDetail';
import Login from './components/Login';
import Register from './components/Register';
import Favorites from './components/Favorites';
import AdminDashboard from './components/AdminDashboard';
import AdminMovieManagement from './components/AdminMovieManagement';
import AdminUserManagement from './components/AdminUserManagement';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile';



function App() {
  const [movies, setMovies] = useState({ all: [] });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const MOVIES_PER_PAGE = 20;

  const navigate = useNavigate();

  const fetchAllMovies = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies?page=${page}&limit=${MOVIES_PER_PAGE}`);
      const data = await res.json();
      if (data && Array.isArray(data.movies)) {
        setMovies(prev => ({ ...prev, all: data.movies }));
        setTotalPages(data.last_page || 1);
      } else {
        setMovies(prev => ({ ...prev, all: [] }));
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi tải tất cả phim:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword) => {
    if (!keyword.trim()) return;
    setSearchResults([]);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies?search=${encodeURIComponent(keyword)}&page=1&limit=50`);
      const data = await res.json();
      setSearchResults(data.movies || []);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm phim:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    setSearchResults([]);
    setCurrentPage(1);
    fetchAllMovies(1);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id && parsedUser.token) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (!initializing && searchResults.length === 0) {
      fetchAllMovies(currentPage);
    }
  }, [currentPage, initializing]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/');
    fetchAllMovies(1);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
    fetchAllMovies(1);
    setCurrentPage(1);
  };

  const handleRegisterSuccess = () => navigate('/login');

  if (initializing) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Đang tải ứng dụng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header
        user={user}
        isAuthenticated={!!user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        onHomeClick={handleHomeClick}
        navigate={navigate}
      />

      <main className="pt-24">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                {loading ? (
                  <p className="text-white text-center py-10">Đang tải kết quả...</p>
                ) : searchResults.length > 0 ? (
                  <MovieSearch title="Kết Quả Tìm Kiếm" data={searchResults} />
                ) : (
                  <>
                    <MovieList title="Tất cả phim" data={movies.all} />
                    <div className="flex justify-center mt-6 space-x-4">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                      >
                        Trang trước
                      </button>
                      <span className="text-white">Trang {currentPage} / {totalPages}</span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                      >
                        Trang sau
                      </button>
                    </div>
                  </>
                )}
              </>
            }
          />
          <Route path="/movie/:id" element={<MovieDetail user={user} key={user?.id || 'guest'} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
          <Route path="/favorites" element={<Favorites user={user} />} />
          <Route path="/profile" element={<UserProfile user={user} />} />

          {user?.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/movies" element={<AdminMovieManagement user={user} onMoviesUpdated={() => fetchAllMovies(currentPage)} />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
            </>
          )}
        </Routes>
      </main>
      <Footer />

    </div>
  );
}

export default App;
