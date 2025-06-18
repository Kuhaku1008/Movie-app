import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

Modal.setAppElement('#root');

const MovieFormModal = ({ isOpen, movie, onClose, onSave }) => {
   
    const [formData, setFormData] = useState({
        id: movie?.id || null, 
        tmdb_id: movie?.tmdb_id || '',
        title: movie?.title || '',
        original_title: movie?.original_title || '',
        overview: movie?.overview || '',
        release_date: movie?.release_date || '',
        poster_path: movie?.poster_path || '',
        backdrop_path: movie?.backdrop_path || '',
        vote_average: movie?.vote_average || 0,
        vote_count: movie?.vote_count || 0,
        popularity: movie?.popularity || 0,
        runtime: movie?.runtime || 0,
        genres: movie?.genres || [], 
        director: movie?.director || '',
        cast: movie?.cast || [], 
        trailer_key: movie?.trailer_key || '',
        watch_url: movie?.watch_url || '',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [formErrors, setFormErrors] = useState({}); 
    useEffect(() => {
        if (movie) {
            setFormData({
                id: movie.id,
                tmdb_id: movie.tmdb_id || '',
                title: movie.title || '',
                original_title: movie.original_title || '',
                overview: movie.overview || '',
                release_date: movie.release_date || '',
                poster_path: movie.poster_path || '',
                backdrop_path: movie.backdrop_path || '',
                vote_average: movie.vote_average || 0,
                vote_count: movie.vote_count || 0,
                popularity: movie.popularity || 0,
                runtime: movie.runtime || 0,
                genres: Array.isArray(movie.genres) ? movie.genres : (movie.genres ? JSON.parse(movie.genres) : []), 
                cast: Array.isArray(movie.cast) ? movie.cast : (movie.cast ? JSON.parse(movie.cast) : []), 
                watch_url: movie.watch_url || '',
            });
        } else {
            setFormData({
                id: null,
                tmdb_id: '',
                title: '',
                original_title: '',
                overview: '',
                release_date: '',
                poster_path: '',
                backdrop_path: '',
                vote_average: 0,
                vote_count: 0,
                popularity: 0,
                runtime: 0,
                genres: [],
                director: '',
                cast: [],
                trailer_key: '',
                watch_url: '',
            });
        }
        setFormErrors({}); 
        setSearchTerm(''); 
        setTmdbSearchResults([]); 
    }, [isOpen, movie]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSearchTmdb = async () => {
        if (!searchTerm.trim()) {
            setSearchError("Vui lòng nhập từ khóa tìm kiếm.");
            setTmdbSearchResults([]);
            return;
        }
        setLoadingSearch(true);
        setSearchError(null);
        try {
            const res = await fetch(`http://localhost:5000/api/public/tmdb/search?query=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Lỗi khi tìm kiếm phim từ TMDB.');
            }
            const data = await res.json();
            setTmdbSearchResults(data);
        } catch (err) {
            console.error("Lỗi tìm kiếm TMDB:", err);
            setSearchError(err.message || "Không thể tìm kiếm phim từ TMDB.");
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleSelectTmdbMovie = async (tmdbId) => {
        setLoadingSearch(true); 
        setSearchError(null);
        try {
            const res = await fetch(`http://localhost:5000/api/public/tmdb/movie/${tmdbId}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Lỗi khi lấy chi tiết phim từ TMDB.');
            }
            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                tmdb_id: data.tmdb_id,
                title: data.title,
                original_title: data.original_title,
                overview: data.overview,
                release_date: data.release_date,
                poster_path: data.poster_path,
                backdrop_path: data.backdrop_path,
                vote_average: data.vote_average,
                vote_count: data.vote_count,
                popularity: data.popularity,
                runtime: data.runtime,
                genres: data.genres,
                director: data.director,
                cast: data.cast,
                trailer_key: data.trailer_key,
                watch_url: data.watch_url,
            }));
            setTmdbSearchResults([]); 
            setSearchTerm(''); 
            setFormErrors({}); 
            console.error("Lỗi khi chọn phim TMDB:", err);
            setSearchError(err.message || "Không thể lấy chi tiết phim từ TMDB.");
        } finally {
            setLoadingSearch(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Tiêu đề phim là bắt buộc.';
        if (!formData.overview.trim()) errors.overview = 'Mô tả tổng quan là bắt buộc.';
        if (!formData.release_date.trim()) errors.release_date = 'Ngày phát hành là bắt buộc.';
        if (!formData.poster_path.trim()) errors.poster_path = 'Đường dẫn poster là bắt buộc.';
        if (!formData.tmdb_id) errors.tmdb_id = 'TMDB ID là bắt buộc (Hãy tìm và chọn phim từ TMDB).';

        setFormErrors(errors);
        return Object.keys(errors).length === 0; 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Dữ liệu formData gửi đi:", formData); 
            onSave(formData);
        } else {
            console.warn("Lỗi xác thực form frontend:", formErrors);
            alert("Vui lòng điền đầy đủ các thông tin phim bắt buộc!");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50"
            contentLabel={movie ? "Chỉnh sửa phim" : "Thêm phim mới"}
        >
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white">
                <h2 className="text-2xl font-bold mb-4">{movie ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">Tìm kiếm và nhập từ TMDB</h3>
                    <div className="flex space-x-2 mb-3">
                        <input
                            type="text"
                            className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                            placeholder="Tìm phim trên TMDB..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={handleSearchTmdb}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                            disabled={loadingSearch}
                        >
                            {loadingSearch ? 'Đang tìm...' : 'Tìm kiếm'}
                        </button>
                    </div>
                    {searchError && <p className="text-red-500 text-sm mb-2">{searchError}</p>}
                    {loadingSearch && <p className="text-blue-400 text-sm mb-2">Đang tải kết quả tìm kiếm...</p>}

                    {tmdbSearchResults.length > 0 && (
                        <div className="border border-gray-700 rounded p-2 max-h-48 overflow-y-auto mb-4">
                            {tmdbSearchResults.map(result => (
                                <div key={result.id} className="flex items-center space-x-3 py-2 border-b border-gray-700 last:border-b-0">
                                    {result.poster_path && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                                            alt={result.title}
                                            className="w-12 h-auto rounded"
                                        />
                                    )}
                                    <div className="flex-grow">
                                        <p className="font-semibold">{result.title}</p>
                                        <p className="text-sm text-gray-400">{result.release_date}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelectTmdbMovie(result.id)}
                                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                                    >
                                        Chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* TMDB ID */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="tmdb_id">
                            TMDB ID:
                        </label>
                        <input
                            type="text"
                            id="tmdb_id"
                            name="tmdb_id"
                            value={formData.tmdb_id}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                            readOnly 
                        />
                        {formErrors.tmdb_id && <p className="text-red-500 text-xs mt-1">{formErrors.tmdb_id}</p>}
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="title">
                            Tiêu đề:
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                    </div>

                    {/* Original Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="original_title">
                            Tiêu đề gốc:
                        </label>
                        <input
                            type="text"
                            id="original_title"
                            name="original_title"
                            value={formData.original_title}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                    </div>

                    {/* Overview */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="overview">
                            Mô tả tổng quan:
                        </label>
                        <textarea
                            id="overview"
                            name="overview"
                            value={formData.overview}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        ></textarea>
                        {formErrors.overview && <p className="text-red-500 text-xs mt-1">{formErrors.overview}</p>}
                    </div>

                    {/* Release Date */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="release_date">
                            Ngày phát hành:
                        </label>
                        <input
                            type="date"
                            id="release_date"
                            name="release_date"
                            value={formData.release_date}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        {formErrors.release_date && <p className="text-red-500 text-xs mt-1">{formErrors.release_date}</p>}
                    </div>

                    {/* Poster Path */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="poster_path">
                            Đường dẫn Poster (URL hoặc Path của TMDB):
                        </label>
                        <input
                            type="text"
                            id="poster_path"
                            name="poster_path"
                            value={formData.poster_path}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        {formErrors.poster_path && <p className="text-red-500 text-xs mt-1">{formErrors.poster_path}</p>}
                        {formData.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w200${formData.poster_path}`}
                                alt="Poster Preview"
                                className="mt-2 rounded max-h-40 object-contain"
                            />
                        )}
                    </div>

                    {/* Backdrop Path */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="backdrop_path">
                            Đường dẫn Backdrop :
                        </label>
                        <input
                            type="text"
                            id="backdrop_path"
                            name="backdrop_path"
                            value={formData.backdrop_path}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        {formData.backdrop_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${formData.backdrop_path}`}
                                alt="Backdrop Preview"
                                className="mt-2 rounded max-h-40 object-contain"
                            />
                        )}
                    </div>

                    {/* Vote Average, Vote Count, Popularity, Runtime (Inputs numerik) */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="vote_average">Điểm đánh giá:</label>
                            <input type="number" id="vote_average" name="vote_average" step="0.1" value={formData.vote_average} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="vote_count">Số lượt đánh giá:</label>
                            <input type="number" id="vote_count" name="vote_count" value={formData.vote_count} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="popularity">Độ phổ biến:</label>
                            <input type="number" id="popularity" name="popularity" step="0.01" value={formData.popularity} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="runtime">Thời lượng (phút):</label>
                            <input type="number" id="runtime" name="runtime" value={formData.runtime} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="genres">
                            Thể loại :
                        </label>
                        <input
                            type="text"
                            id="genres"
                            name="genres"
                            
                            value={Array.isArray(formData.genres) ? JSON.stringify(formData.genres.map(g => g.name || g)) : (typeof formData.genres === 'string' ? formData.genres : '')}
                            onChange={(e) => {
                                
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setFormData(prev => ({ ...prev, genres: parsed }));
                                } catch {
                                    setFormData(prev => ({ ...prev, genres: e.target.value })); 
                                }
                            }}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                            placeholder='Ví dụ: ["Hành động", "Phiêu lưu"]'
                        />
                        <p className="text-xs text-gray-400 mt-1">Lưu ý: Thể loại nên là mảng các chuỗi hoặc đối tượng {`{id: ..., name: ...}`} được JSON.stringify()</p>
                    </div>

                    {/* Director */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="director">
                            Đạo diễn:
                        </label>
                        <input
                            type="text"
                            id="director"
                            name="director"
                            value={formData.director}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="cast">
                            Diễn viên :
                        </label>
                        <input
                            type="text"
                            id="cast"
                            name="cast"
                            value={Array.isArray(formData.cast) ? JSON.stringify(formData.cast.map(c => c.name || c)) : (typeof formData.cast === 'string' ? formData.cast : '')}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setFormData(prev => ({ ...prev, cast: parsed }));
                                } catch {
                                    setFormData(prev => ({ ...prev, cast: e.target.value })); 
                                }
                            }}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                            placeholder='Ví dụ: ["Tom Cruise", "Rebecca Ferguson"]'
                        />
                        <p className="text-xs text-gray-400 mt-1">Lưu ý: Diễn viên nên là mảng các chuỗi hoặc đối tượng {`{name: ..., character: ...}`} được JSON.stringify()</p>
                    </div>

                    {/* Trailer Key */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="trailer_key">
                            Mã Trailer YouTube :
                        </label>
                        <input
                            type="text"
                            id="trailer_key"
                            name="trailer_key"
                            value={formData.trailer_key}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        {formData.trailer_key && (
                            <div className="mt-2">
                                <a
                                    href={`https://www.youtube.com/watch?v=${formData.trailer_key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline text-sm"
                                >
                                    Xem Trailer
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Watch URL */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="watch_url">
                            Đường dẫn xem phim:
                        </label>
                        <input
                            type="url"
                            id="watch_url"
                            name="watch_url"
                            value={formData.watch_url}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                            placeholder="https://example.com/watch-movie"
                        />
                        {formData.watch_url && (
                            <div className="mt-2">
                                <a
                                    href={formData.watch_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline text-sm"
                                >
                                    Xem ngay
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Lưu phim
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

MovieFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    movie: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default MovieFormModal;