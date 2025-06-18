import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Favorites = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !user.id || !user.token) {
        setLoading(false);
        setError("Vui lòng đăng nhập để xem phim đã theo dõi.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/user/favorites`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
          }
          const errorData = await res.json();
          throw new Error(errorData.message || 'Không thể tải danh sách phim yêu thích.');
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.warn(" API không trả về mảng:", data);
          setFavorites([]);
          setError("Dữ liệu phim yêu thích không hợp lệ.");
        }
      } catch (err) {
        console.error(' Lỗi khi lấy danh sách theo dõi:', err);
        setFavorites([]);
        setError(err.message || 'Lỗi khi tải danh sách phim yêu thích.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (loading) {
    return <p className="text-white text-center py-10">Đang tải danh sách phim yêu thích...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center py-10">{error}</p>;
  }

  if (!user || !user.id) {
    return <p className="text-white text-center py-10">Vui lòng đăng nhập để xem phim đã theo dõi.</p>;
  }

  return (
    <div className="text-white p-10 pt-24">
      <h2 className="text-2xl font-bold mb-6">Phim bạn đã theo dõi</h2>
      {Array.isArray(favorites) && favorites.length === 0 ? (
        <p>Chưa có phim nào được theo dõi.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {favorites.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="rounded-lg hover:scale-105 transition-transform duration-200"
              />
              <p className="mt-2 text-sm text-center">{movie.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

Favorites.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
    role: PropTypes.string,
    token: PropTypes.string,
  }),
};

export default Favorites;
