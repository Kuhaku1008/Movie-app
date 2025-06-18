import React, { useState, useEffect } from 'react';
import MovieFormModal from './MovieFormModal';
import PropTypes from 'prop-types'; 


const AdminMovieManagement = ({ user, onMoviesUpdated }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const fetchMovies2 = async () => {
        setLoading(true);
        setError(null);

        if (!user || !user.token) {
            setError("Bạn cần đăng nhập với quyền admin để xem danh sách phim.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/admin/movies', { 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(` Lỗi fetchMovies2: HTTP Status ${res.status}`, errorText);
                throw new Error(`Không thể tải phim: ${res.statusText || errorText}`);
            }

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                setMovies(data);
            } else {
                const responseText = await res.text();
                console.error(" Phản hồi không phải JSON:", responseText);
                throw new Error("Phản hồi từ server không phải JSON. Có thể có lỗi server hoặc đường dẫn sai.");
            }

        } catch (err) {
            console.error(' Lỗi khi lấy danh sách phim (Admin):', err);
            setError(err.message || "Lỗi khi tải danh sách phim.");
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies2();
    }, [user]);

    const handleOpenAddModal = () => {
        setSelectedMovie(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovie(null);
        fetchMovies2(); 
        if (onMoviesUpdated) {
            onMoviesUpdated();
        }
    };

    const handleSaveMovie = async (movieData) => {
        if (!user || !user.token) {
            alert("Bạn cần đăng nhập để lưu phim.");
            return;
        }

        try {
            const method = movieData.id ? 'PUT' : 'POST';
            const url = movieData.id
                ? `http://localhost:5000/api/admin/movies/${movieData.id}`
                : 'http://localhost:5000/api/admin/movies';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(movieData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Lỗi khi ${movieData.id ? 'cập nhật' : 'thêm'} phim.`);
            }

            alert(`Phim đã được ${movieData.id ? 'cập nhật' : 'thêm'} thành công!`);
            handleCloseModal();
        } catch (err) {
            console.error(` Lỗi khi ${movieData.id ? 'cập nhật' : 'thêm'} phim:`, err);
            alert(err.message || "Đã xảy ra lỗi khi lưu phim.");
        }
    };

    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phim này?")) {
            return;
        }
        if (!user || !user.token) {
            alert("Bạn cần đăng nhập để xóa phim.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/admin/movies/${movieId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Lỗi khi xóa phim.");
            }

            alert("Phim đã được xóa thành công!");
            fetchMovies2(); 
            if (onMoviesUpdated) { 
                onMoviesUpdated();
            }
        } catch (err) {
            console.error(" Lỗi khi xóa phim:", err);
            alert(err.message || "Đã xảy ra lỗi khi xóa phim.");
        }
    };

    if (loading) {
        return <p className="text-white text-center py-10">Đang tải danh sách phim...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center py-10">{error}</p>;
    }

    return (
        <div className="text-white p-10 pt-24">
            <h2 className="text-2xl font-bold mb-6">Quản lý phim</h2>
            <button
                onClick={handleOpenAddModal}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-6"
            >
                Thêm phim mới
            </button>

            {movies.length === 0 ? (
                <p>Không có phim nào được quản lý.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movies.map((movie) => (
                        <div key={movie.id} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                            {movie.poster_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    className="rounded-lg w-16 h-24 object-cover flex-shrink-0"
                                />
                            )}
                            <div className="flex-grow text-center sm:text-left">
                                <h3 className="font-semibold text-lg">{movie.title}</h3>
                                <p className="text-sm text-gray-400">ID: {movie.id}</p>
                                <p className="text-sm text-gray-400">Ngày phát hành: {movie.release_date}</p>
                            </div>
                            <div className="flex-shrink-0 flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 mt-3 sm:mt-0">
                                <button
                                    onClick={() => handleOpenEditModal(movie)}
                                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDeleteMovie(movie.id)}
                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MovieFormModal
                isOpen={isModalOpen}
                movie={selectedMovie}
                onClose={handleCloseModal}
                onSave={handleSaveMovie}
            />
        </div>
    );
};

AdminMovieManagement.propTypes = {
    user: PropTypes.object,
    onMoviesUpdated: PropTypes.func, 
};


export default AdminMovieManagement;