import { useState } from 'react';
import PropTypes from 'prop-types';

function Header({ onSearch }) {
  const [textSearch, setTextSearch] = useState('');

  return (
    <div className="p-4 bg-black fixed top-0 left-0 w-full z-50 flex items-center justify-between shadow-md">
      
      {/* Logo + Navigation */}
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl uppercase font-bold text-red-600 tracking-wide">
          Movie
        </h1>
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-white hover:text-red-500 transition">
            Home
          </a>
          <a href="#" className="text-white hover:text-red-500 transition">
            About
          </a>
          <a href="#" className="text-white hover:text-red-500 transition">
            Contact
          </a>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Search movies..."
          className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          onChange={(e) => setTextSearch(e.target.value)}
          value={textSearch}
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          onClick={() => onSearch(textSearch)}
        >
          Search
        </button>
      </div>
    </div>
  );
}

Header.propTypes = {
  onSearch: PropTypes.func,
};

export default Header;

