import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import LogIn from './routes/LogIn';
import SignUp from './routes/SignUp';
import Home from './routes/Home';
import CheckUser from './routes/CheckUser';
import { useAuth } from "./utils/authProvider";
import LogOut from "./routes/LogOut";
import AddSong from "./routes/AddSong";
import MySong from "./routes/MySong";
import Search from "./routes/Search";
import MyPlaylist from "./routes/MyPlaylist";
import SinglePlaylist from "./routes/SinglePlaylist";
import LikedSongs from "./routes/LikedSong";
import SongContext from "./contexts/SongContext";
import Recents from "./routes/Recents";
import EditProfile from "./routes/EditProfile";
import LandingPage from "./routes/LandingPage";
import ArtistProfile from "./routes/ArtistProfile";
import AllArtists from "./routes/AllArtists";
import AllPlaylists from "./routes/AllPLaylists";
import GoogleAuthSuccess from "./routes/GoogleAuthSuccess";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";
import UpdatePassword from "./routes/UpdatePassword";
import UserProfile from "./routes/UserProfile";
import Followers from "./routes/Followers";
// import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  const { currentUser } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [songPlayed, setSongPlayed] = useState(null);
  const [isPaused, setIsPaused] = useState(null);
  const [songData, setSongData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState({
    isOpen: false,
    song: null,
});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [queue, setQueue] = useState([]);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(null);
  const [volumeIcon, setVolumeIcon] = useState("fa-solid fa-volume-high");
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [isSideVisible, setIsSideVisible] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isRegisterAsArtistModalOpen, setIsRegisterAsArtistModalOpen] = useState(false);
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [savedPosition, setSavedPosition] = useState(0);
  
  
  console.log("User is: ", currentUser);
  


  const soundRef = useRef(null);  // Persist Howl instance

  const [volume, setVolume] = useState(() => {
    // Retrieve volume from local storage or set default to 1
    return parseFloat(localStorage.getItem('volume')) || 1;
  });

  useEffect(() => {
    // Save volume to local storage whenever it changes
    localStorage.setItem('volume', volume);
  }, [volume]);

  return (
    <SongContext.Provider
      value={{
        currentSong,setCurrentSong,
        songPlayed,setSongPlayed,
        isPaused,setIsPaused,
        songData,setSongData,
        isCreatePlaylistModalOpen,setIsCreatePlaylistModalOpen,
        isAddToPlaylistModalOpen,setIsAddToPlaylistModalOpen,
        currentTime,setCurrentTime,
        duration,setDuration,
        intervalId,setIntervalId,
        soundRef,
        playlist,setPlaylist,
        currentSongIndex,setCurrentSongIndex,
        queue, setQueue,
        isQueueModalOpen, setIsQueueModalOpen,
        volumeIcon, setVolumeIcon,
        volume, setVolume, resumeTime, setResumeTime, 
        isRepeatMode, setIsRepeatMode,
        isSideVisible, setIsSideVisible,
        isLeftPanelOpen, setIsLeftPanelOpen,
        historyData, setHistoryData, isArtist, setIsArtist,
        isRegisterAsArtistModalOpen, setIsRegisterAsArtistModalOpen,
        artistData, setArtistData, isPlaylistPlaying, setIsPlaylistPlaying
      }}
    >
      <BrowserRouter>
        {currentUser ? (
          <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/curruser" element={<CheckUser />} />
            <Route path="/home" element={<Home />} />
            <Route path="/logout" element={<LogOut />} />
            <Route path="/addsong" element={<AddSong />} />
            <Route path="/mysong" element={<MySong />} />
            <Route path="/myplaylist" element={<MyPlaylist />} />
            <Route path="/myplaylist/:playlistId" element={<SinglePlaylist />} />
            <Route path="/likedSongs" element={<LikedSongs />} />
            <Route path="/search" element={<Search />} />
            <Route path="/history" element={<Recents />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route path="/artist/:artistId" element={<ArtistProfile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/allArtists" element={<AllArtists />} />
            <Route path="/allPlaylists" element={<AllPlaylists />} />
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
            <Route path="/updatepassword" element={<UpdatePassword />} />
            <Route path="/myfollowing" element={<Followers />} />
            <Route path="/recents" element={<Recents />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/curruser" element={<CheckUser />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        )}
      </BrowserRouter>
    </SongContext.Provider>
  );
}

export default App;
