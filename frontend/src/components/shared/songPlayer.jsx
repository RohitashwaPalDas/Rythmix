import { useState, useEffect, useContext } from "react";
import { Howl, Howler } from 'howler';
import SongContext from "../../contexts/SongContext";
import "../../public/css/SongPlayer.css";

export default function SongPlayer() {
    const [songPlayed, setSongPlayed] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const { currentSong } = useContext(SongContext);

    useEffect(() => {
        if (!currentSong) return;
        changeSong(currentSong.track);
    }, [currentSong]);

    const changeSong = (SongSrc) => {
        if (songPlayed) {
            songPlayed.stop();  // Stop the previous song
        }

        const sound = new Howl({
            src: [SongSrc],
            html5: true,
        });

        setSongPlayed(sound);
        sound.play();
        setIsPaused(false);
    };

    const playSound = () => {
        if (!songPlayed) return;
        songPlayed.play();
        setIsPaused(false);
    };

    const pauseSound = () => {
        if (!songPlayed) return;
        songPlayed.pause();
        setIsPaused(true);
    };

    const togglePlayPause = () => {
        if (!songPlayed) return;
        if (isPaused) {
            playSound();
        } else {
            pauseSound();
        }
    };

    return (
        <div className="SongPlayer">
            <div className="songInfo">
                <div className="image2">
                    <div className="background" style={{ backgroundImage: `url(${currentSong?.thumbnail})` }}></div>
                    <div className="overlay"></div>
                    <div className="playLogo2">
                        <i className="fa-solid fa-chevron-up"></i>
                    </div>
                </div>

                <div className="det2">
                    <div className="title2">{currentSong?.name}</div>
                    <div className="artist2">{currentSong?.artist.firstname + " " + currentSong?.artist.lastname}</div>
                </div>

                <div className="addlikesong">
                    <i className="fa-solid fa-plus"></i>
                    <i class="fa-solid fa-house"></i>
                </div>
            </div>

            <div className="play-sec">
                <i className="fa-solid fa-shuffle effectSong"></i>
                <i className="fa-solid fa-backward-step changeSong"></i>
                <i className={isPaused ? "fa-regular fa-circle-play circlePlay" : "fa-regular fa-circle-pause circlePlay"} onClick={togglePlayPause}></i>
                <i className="fa-solid fa-forward-step changeSong"></i>
                <i className="fa-solid fa-repeat effectSong"></i>
                <i class="fa-solid fa-cart-plus effectSong"></i>
                <i class="fa-solid fa-house"></i>
            </div>

            <div className="xtraBtns">
                <i className="fa-solid fa-microphone"></i>
                <i className="fa-solid fa-folder-plus"></i>
                <i className="fa-solid fa-folder-plus"></i>
                <i class="fa-solid fa-cart-plus"></i>
            </div>
        </div>
    );
}
