import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const MovieList = ({ title, data }) => {
  return (
    <div className="text-white p-10 mb-10">
      <h2 className="uppercase text-xl mb-4">{title}</h2>

      {data.length === 0 ? (
        <p className="text-gray-400">Không có phim nào.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data.map((item) => (
            <Link to={`/movie/${item.id}`} key={item.id} className="block">
              <div className="relative w-full pt-[150%] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title}
                  className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Tên phim */}
              <p className="text-sm text-white mt-2 text-center truncate">
                {item.title || item.original_title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

MovieList.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array.isRequired,
};

export default MovieList;
