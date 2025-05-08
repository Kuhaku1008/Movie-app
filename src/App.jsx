import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Chỉ giữ Routes, Route và useNavigate
import Header from './components/Header';
import Banner from './components/Banner';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import MovieDetail from './components/MovieDetail';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [movies, setMovies] = useState({ popular: [], topRated: [] });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const handleSearch = async (searchVal) => {
        // ... (giữ nguyên)
    };

    useEffect(() => {
        // ... (giữ nguyên)
    }, []);

    const navigate = useNavigate();

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        navigate('/');
    };

    const handleRegisterSuccess = (userData) => {
        navigate('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <div className="bg-black pb-10">
            <Header
                onSearch={handleSearch}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
                navigate={navigate}
            />
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
                                    <MovieList title="Phim Hot" data={movies.popular} />
                                    <MovieList title="Phim Đề Cử" data={movies.topRated} />
                                </>
                            )}
                        </>
                    }
                />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route
                    path="/login"
                    element={<Login onLoginSuccess={handleLoginSuccess} />}
                />
                <Route
                    path="/register"
                    element={<Register onRegisterSuccess={handleRegisterSuccess} />}
                />
            </Routes>
        </div>
    );
}

export default App;
