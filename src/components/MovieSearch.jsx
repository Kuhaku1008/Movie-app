import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const MovieSearch = ({ title, data }) => {
  return (
    <div className="text-white p-10 mb-10">
      <h2 className="uppercase text-xl mb-4">{title}</h2>
      <div className="grid grid-cols-5 gap-6">
        {data && data.map((item) => (
          <Link
            to={`/movie/${item.id}`}
            key={item.id}
            className="w-[200px] h-[300px] relative group block"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10" />
            <img
              src={`${import.meta.env.VITE_IMG_URL}${item.poster_path}`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <p className="uppercase text-md">{item.title || item.original_title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

MovieSearch.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
};

export default MovieSearch;
