import { Link } from "react-router-dom";

const MovieList = ({ title, data }) => {
  return (
    <div className="text-white p-5">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`}>
            <div className="cursor-pointer transform transition duration-300 hover:scale-105">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="rounded-lg"
              />
              <p className="mt-2 text-center">{movie.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
