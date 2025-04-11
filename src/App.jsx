import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import MovieList from "./components/MovieList";
import MovieSearch from "./components/MovieSearch";
import MovieDetail from "./components/MovieDetail"; // Import trang chi tiết phim

function App() {
  const [movies, setMovies] = useState({ popular: [], topRated: [] });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchVal) => {
    if (!searchVal.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchVal)}&include_adult=false&language=vi&page=1`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phim:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        };

        const [popularRes, topRatedRes] = await Promise.all([
          fetch("https://api.themoviedb.org/3/movie/popular?language=vi&page=1", options),
          fetch("https://api.themoviedb.org/3/movie/top_rated?language=vi&page=1", options),
        ]);

        const popularData = await popularRes.json();
        const topRatedData = await topRatedRes.json();

        setMovies({
          popular: popularData.results,
          topRated: topRatedData.results,
        });
      } catch (error) {
        console.error("Lỗi khi tải phim:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <Router>
      <div className="bg-black pb-10">
        <Header onSearch={handleSearch} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                {loading ? (
                  <p className="text-white text-center py-10">Đang tải kết quả...</p>
                ) : searchResults.length > 0 ? (
                  <MovieSearch title="Kết Quả Tìm Kiếm" data={searchResults} />
                ) : (
                  <>
                    <MovieList title="Phim Hot" data={movies.popular} />
                    <MovieList title="Phim Đề Cử" data={movies.topRated} />
                  </>
                )}
              </>
            }
          />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
