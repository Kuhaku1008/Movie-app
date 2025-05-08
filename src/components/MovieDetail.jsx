import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from 'react-modal';
import YouTube from 'react-youtube';

const opts = {
  height: '390',
  width: '640',
  playerVars: {
    autoplay: 1,
  },
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState("");

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${id}?language=vi`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        };

        const response = await fetch(url, options);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết phim:", error);
      }
      setLoading(false);
    };

    fetchMovieDetail();
  }, [id]);

  const handleWatchTrailer = async () => {
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();
      const trailer = data.results.find(
        (vid) => vid.type === "Trailer" && vid.site === "YouTube"
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setModalIsOpen(true);
      } else {
        alert("Không tìm thấy trailer cho phim này!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy trailer:", error);
    }
  };

  if (loading) return <p className="text-white text-center py-10">Đang tải...</p>;
  if (!movie) return <p className="text-white text-center py-10">Không tìm thấy phim</p>;

  return (
    <div className="text-white p-10 pt-24">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full md:w-80 rounded-lg shadow-md"
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <p className="text-lg mb-4">{movie.overview}</p>
          <div className="mb-4">
            <p className="font-semibold">Điểm đánh giá:</p>
            <p className="text-xl">⭐ {movie.vote_average}/10</p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Ngày phát hành:</p>
            <p>{movie.release_date}</p>
          </div>
          {movie.genres && (
            <div className="mb-4">
              <p className="font-semibold">Thể loại:</p>
              <p>{movie.genres.map((g) => g.name).join(", ")}</p>
            </div>
          )}
          {movie.runtime && (
            <div className="mb-4">
              <p className="font-semibold">Thời lượng:</p>
              <p>{movie.runtime} phút</p>
            </div>
          )}
          {movie.production_countries && (
            <div className="mb-4">
              <p className="font-semibold">Quốc gia sản xuất:</p>
              <p>{movie.production_countries.map((c) => c.name).join(", ")}</p>
            </div>
          )}

          
          <button
            onClick={handleWatchTrailer}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition mt-6"
          >
            Xem phim
          </button>
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
          className="text-white text-xl absolute top-2 right-4"
        >
          ✖
        </button>
        <YouTube videoId={trailerKey} opts={opts} />
      </Modal>
    </div>
  );
};

export default MovieDetail;
