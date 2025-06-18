import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import YouTube from "react-youtube";

Modal.setAppElement("#root");

const opts = {
  height: "390",
  width: "640",
  playerVars: { autoplay: 1 },
};

const MovieDetail = ({ user }) => {
  console.log("MovieDetail component render. Received user prop:", user);

  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState("");
  const [isFavorited, setIsFavorited] = useState(false); 

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/public/movies/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Không thể tải chi tiết phim.');
        }
        const data = await res.json();

        const formattedMovie = {
          ...data,
          vote_average: Number(data.vote_average) || 0, 
          genres: Array.isArray(data.genres) ? data.genres : (data.genres ? JSON.parse(data.genres) : []), 
          cast: Array.isArray(data.cast) ? data.cast : (data.cast ? JSON.parse(data.cast) : []),
        };

        setMovie(formattedMovie);
        setTrailerKey(data.trailer_key); 
      } catch (err) {
        console.error(' Lỗi khi lấy chi tiết phim:', err);
        setError(err.message || 'Lỗi khi tải chi tiết phim.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]); 


  useEffect(() => {
    const checkFavoriteStatus = async () => {
      console.log("checkFavoriteStatus: User state for status check:", user);

      if (!user || !user.token || !movie?.id) {
        setIsFavorited(false);
        console.warn("checkFavoriteStatus: Skipping favorite status check because user/token/movie_id is missing.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/user/favorites/status/${movie.id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsFavorited(data.isFavorited);
          console.log("Favorite status fetched:", data.isFavorited);
        } else {
            const errorData = await res.json();
            console.error("Failed to fetch favorite status:", errorData.message || res.statusText);
            setIsFavorited(false); 
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', err);
        setIsFavorited(false); 
      }
    };


    if (movie) {
      checkFavoriteStatus();
    }

  }, [user, movie]);

  const handleFavorite = async () => { 
    console.log("handleFavorite: User state when clicking favorite:", user);

    if (!user || !user.token) {
      alert("Vui lòng đăng nhập để thêm/xóa phim yêu thích.");
      navigate('/login'); 
      return;
    }
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited ?
        `http://localhost:5000/api/user/favorites/${movie.id}` :
        `http://localhost:5000/api/user/favorites`;

      const body = !isFavorited ? JSON.stringify({ movieId: movie.id }) : null;

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Lỗi khi ${isFavorited ? 'xóa khỏi' : 'thêm vào'} yêu thích.`);
      }

      setIsFavorited(!isFavorited); 
      alert(`Phim đã được ${isFavorited ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích.`);
    } catch (err) {
      console.error('Lỗi thao tác yêu thích:', err);
      alert(err.message || 'Đã xảy ra lỗi khi cập nhật danh sách yêu thích.');
    }
  };

  if (loading) {
    return <p className="text-white text-center py-10">Đang tải chi tiết phim...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center py-10">{error}</p>;
  }

  if (!movie) {
    return <p className="text-white text-center py-10">Không tìm thấy phim.</p>;
  }

  return (
    <div className="text-white pt-24 min-h-screen relative">
      {movie.backdrop_path && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
        ></div>
      )}

      <div className="relative z-10 p-4 md:p-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full md:w-80 rounded-lg shadow-lg flex-shrink-0"
          />
        )}

        {/* Movie Details */}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>
          <p className="text-gray-400 text-lg mb-2">{movie.original_title}</p>
          <p className="text-lg mb-4">{movie.overview}</p>

          <div className="mb-4">
            <p className="text-md">
              <span className="font-semibold">Ngày phát hành:</span>{" "}
              {movie.release_date}
            </p>
            <p className="text-md">
              <span className="font-semibold">Đánh giá trung bình:</span>{" "}
              {movie.vote_average?.toFixed(1)} / 10 ({movie.vote_count} lượt)
            </p>
            <p className="text-md">
              <span className="font-semibold">Thời lượng:</span>{" "}
              {movie.runtime} phút
            </p>
            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <p className="text-md">
                <span className="font-semibold">Thể loại:</span>{" "}
                {movie.genres.map(genre => genre.name || genre).join(', ')}
              </p>
            )}
            {movie.director && (
              <p className="text-md">
                <span className="font-semibold">Đạo diễn:</span>{" "}
                {movie.director}
              </p>
            )}
            {Array.isArray(movie.cast) && movie.cast.length > 0 && (
              <p className="text-md">
                <span className="font-semibold">Diễn viên chính:</span>{" "}
                {movie.cast.map(actor => actor.name || actor).join(', ')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            {trailerKey && (
              <button
                onClick={() => setModalIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Xem Phim
              </button>
            )}

            {movie.watch_url && (
              <a
                href={movie.watch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center"
              >
                Xem phim
              </a>
            )}

            {user && ( 
                <button
                    onClick={handleFavorite} 
                    className={`font-semibold px-6 py-3 rounded-lg transition
                                ${isFavorited ? 'bg-gray-400 hover:bg-gray-500 text-black' : 'bg-yellow-500 hover:bg-yellow-600 text-black'}`}
                >
                    {isFavorited ? 'Bỏ theo dõi' : 'Theo dõi'}
                </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: { position: "fixed", zIndex: 9999, backgroundColor: "rgba(0,0,0,0.8)" },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            background: "#000",
            border: "none",
            borderRadius: "8px",
            padding: "20px",
          },
        }}
        contentLabel="Trailer"
      >
        <button
          onClick={() => setModalIsOpen(false)}
          className="text-white text-xl absolute top-2 right-4 z-50"
        >
          &times;
        </button>
        {trailerKey ? (
          <YouTube videoId={trailerKey} opts={opts} />
        ) : (
          <p className="text-white text-center">Không có trailer.</p>
        )}
      </Modal>
    </div>
  );
};

export default MovieDetail;