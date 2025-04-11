import PropType from 'prop-types'
import Modal from 'react-modal';
import { useState } from "react";
import YouTube from 'react-youtube';
const opts = {
  height: '390',
  width: '640',
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

const MovieSearch = ({title, data}) => {
    const [modalIsOpen, setModalIsOpen] =useState(false);
    const [trailerKey, setTrailerKey] = useState("");

    const handleTrailer = async (id) => {
      setTrailerKey('')
      try {
          const url = `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`;
          const options = {
              method: 'GET',
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
              },
            };
            const movieKey = await fetch(url, options);
            const data = await movieKey.json();
            setTrailerKey(data.results[0].key);
            setModalIsOpen(true);
          }   catch(error) {
              setModalIsOpen(false);
              console.log(error)
      }
      
  }
  return (
    <div className="text-white p-10 mb-10">
      <h2 className="uppercase text-xl mb-4">{title}</h2>
      <div className="grid grid-cols-4 gap-4">
      {data && data.map((item) => (
        <div key={item.id} className='w-[200px] h-[300px] relative group' 
        onClick={() => handleTrailer(item.id)}
        >
        <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
        <img src={`${import.meta.env.VITE_IMG_URL}${item.poster_path}`} alt={item.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out' />
        <div className="absolute bottom-4 left-4 ">
            <p className="uppercase text-md">{item.title || item.original_title} </p> 
        </div> 
    </div>
      ))}
      
      </div>
      <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={{
                  overlay: {
                    position: 'fixed',
                    zIndex:9999,
                  },
                  content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                  },
                }}
                contentLabel="Example Modal"
            >
                <YouTube videoId={trailerKey} opts={opts}  />;
            </Modal>
    </div>
  )
}

MovieSearch.propTypes = {
    title: PropType.string,
    data: PropType.array,
}

export default MovieSearch