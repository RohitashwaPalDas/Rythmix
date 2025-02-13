import LogInBP from "../boilerplates/LogInBP";
import "../public/css/Home.css";
import { makeAuthGETReq } from "../utils/serverHelper";
import { useEffect, useState, useContext } from "react";
import ArtistCard2 from "../components/shared/artistCard2";
import PlaylistCard from "../components/shared/PlaylistCard";
import { useNavigate } from "react-router-dom";
import SongContext from "../contexts/SongContext"; // Import the context

export default function Home() {
  const [allArtist, setAllArtist] = useState(null);
  const [allPlaylist, setAllPlaylist] = useState(null);
  const [randomArtists, setRandomArtists] = useState([]);
  const [randomPlaylists, setRandomPlaylists] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [leftButtonVisible, setLeftButtonVisible] = useState(false);
  const [rightButtonVisible, setRightButtonVisible] = useState(true);

  const { currentSong, setPlaylist, setCurrentSongIndex, isSideVisible } = useContext(SongContext);
  const navigate = useNavigate();

  useEffect(()=>{
    const IstInvisible = async() =>{
      setLeftButtonVisible(false);
      setRightButtonVisible(false);
    }
    IstInvisible();
  },[]);

  useEffect(() => {
    const fetchAllArtists = async () => {
      try {
        const res = await makeAuthGETReq("/allArtists");
        setAllArtist(res.data);
        selectRandomArtists(res.data);
      } catch (error) {
        console.error("An error occurred: ", error.message);
      }
    };

    const selectRandomArtists = (artists) => {
      const shuffled = [...artists].sort(() => 0.5 - Math.random());
      setRandomArtists(shuffled.slice(0, 4)); // Set 4 random artists
    };

    fetchAllArtists();

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Trigger resize handler on initial render

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchAllPlaylists = async () => {
      try {
        const res = await makeAuthGETReq("/playlists/allPlaylists");
        setAllPlaylist(res.data);
        selectRandomPlaylists(res.data);
      } catch (error) {
        console.error("An error occurred: ", error.message);
      }
    };

    const selectRandomPlaylists = (playlists) => {
      const shuffled = [...playlists].sort(() => 0.5 - Math.random());
      setRandomPlaylists(shuffled.slice(0, 4));
    };

    fetchAllPlaylists();
  }, []);

  useEffect(() => {
    const scrollableElement = document.getElementById("playlistsScrollable");
    if (!scrollableElement) return;
  
    const updateScrollButtonsVisibility = () => {
      const atLeft = scrollableElement.scrollLeft === 0;
      const atRight =
        Math.ceil(scrollableElement.scrollLeft + scrollableElement.clientWidth) >=
        scrollableElement.scrollWidth;
  
      setLeftButtonVisible(!atLeft);
      setRightButtonVisible(!atRight);
    };
  
    scrollableElement.addEventListener("scroll", updateScrollButtonsVisibility);
  
    // Run initially to set the correct state
    updateScrollButtonsVisibility();
  
    return () => {
      scrollableElement.removeEventListener("scroll", updateScrollButtonsVisibility);
    };
  }, [randomPlaylists]);
  

  const handlePlaylistClick = (playlist) => {
    setPlaylist(playlist.songs);
    setCurrentSongIndex(0);
    navigate("/myplaylist/" + playlist._id);
  };

  const seeMore = () => {
    navigate("/allArtists"); // Navigate to the allArtists page
  };

  const seeMorePlaylist = () => {
    navigate("/allPlaylists"); // Navigate to the allArtists page
  };

  if (!allArtist || !allPlaylist) {
    return <div>Loading...</div>; // Display a loading message while data is being fetched
  }

  return (
    <LogInBP>
      <div className="mainSec">
        <div className="artistSection">
          <h2 className="homeHead">Artists</h2>
          <div className="artistScrollContainer">
            <div className="artists" id="artistScrollable">
              {isMobileView
                ? allArtist.map((item, index) => (
                    <ArtistCard2 key={index} info={item} />
                  ))
                : randomArtists.map((item, index) => (
                    <ArtistCard2 key={index} info={item} />
                  ))}
            </div>
          </div>
          <button className="seeMoreBtn" onClick={seeMore}>
            See More
          </button>
        </div>

        <div className="playlistSection">
            <h2 className="homeHead">Playlists</h2>
            <div className="playlistScrollContainer">
                {/* Left arrow for sliding playlists */}
                {isSideVisible && currentSong && (
                <button
                    className="scrollBtn left"
                    onClick={() =>
                    document
                        .getElementById("playlistsScrollable")
                        .scrollBy({ left: -300, behavior: "smooth" })
                    }
                >
                    &#8249; {/* Left arrow */}
                </button>
                )}
                <div className="playlistsHome" id="playlistsScrollable">
                {randomPlaylists.map((item, index) => (
                    <PlaylistCard
                    key={index}
                    info={item}
                    className="playlistCard"
                    playlistId={item._id}
                    onClick={() => handlePlaylistClick(item)} // Pass the selected playlist to the handler
                    />
                ))}
                </div>
                {/* Right arrow for sliding playlists */}
                {isSideVisible && currentSong && (
                <button
                    className="scrollBtn right"
                    onClick={() =>
                    document
                        .getElementById("playlistsScrollable")
                        .scrollBy({ left: 300, behavior: "smooth" })
                    }
                >
                    &#8250; {/* Right arrow */}
                </button>
                )}
            </div>
        </div>
      </div>
    </LogInBP>
  );
}
