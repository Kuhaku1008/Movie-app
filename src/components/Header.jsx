import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

function Header({ onSearch, onHomeClick, isAuthenticated, user, onLogout }) {
  const [textSearch, setTextSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showGenres, setShowGenres] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const genres = [
    'Hành Động', 'Phiêu Lưu', 'Hoạt Hình', 'Hài', 'Tội Phạm',
    'Tài liệu', 'Kịch tính', 'Gia đình', 'Kinh dị', 'Âm nhạc',
    'Bí ẩn', 'Lãng mạn', 'Khoa học viễn tưởng', 'TV Movie', 'Chiến tranh', 'Viễn Tây'
  ];

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleHomeClick = () => {
    if (typeof onHomeClick === 'function') onHomeClick();
  };

  const handleSearch = () => {
    const queryParts = [textSearch.trim(), yearSearch.trim(), selectedGenre.trim()].filter(Boolean);
    const query = queryParts.join(' ');
    if (onSearch) onSearch(query);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenres(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="p-4 bg-black fixed top-0 left-0 w-full z-50 shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center justify-between space-x-6 mb-4 md:mb-0">
          <h1 className="text-2xl uppercase font-bold text-red-600 tracking-wide"> Movie</h1>

          <nav className="flex space-x-4 text-sm md:text-base items-center relative">
            <Link to="/" onClick={handleHomeClick} className="text-white hover:text-red-400 transition">Home</Link>

            {isAuthenticated && (
              <>
                <Link to="/favorites" className="text-white hover:text-red-400 transition">Theo dõi</Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowGenres((prev) => !prev)}
                    className="text-white hover:text-red-400 transition px-2 py-1 rounded cursor-pointer"
                  >
                    {selectedGenre || 'Thể loại'} ▼
                  </button>
                  {showGenres && (
                    <ul className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 w-48">
                      {genres.map((genre, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setSelectedGenre(genre);
                            setShowGenres(false); 
                          }}
                          className="px-4 py-2 hover:bg-red-600 cursor-pointer text-white"
                        >
                          {genre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-400 hover:text-yellow-500 font-semibold">Quản trị</Link>
                )}

                <Link to="/profile" className="text-white hover:text-red-400 transition">Profile</Link>
                <button onClick={handleLogoutClick} className="text-white hover:text-red-400 transition">Đăng Xuất</button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link to="/login" className="text-white hover:text-red-400 transition">Đăng Nhập</Link>
                <Link to="/register" className="text-white hover:text-red-400 transition">Đăng Ký</Link>
              </>
            )}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Tìm theo tên phim..."
            className="p-2 w-40 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-red-500"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            🔍
          </button>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onSearch: PropTypes.func,
  onHomeClick: PropTypes.func,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default Header;
