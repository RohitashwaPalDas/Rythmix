import "../public/css/QueuePlaylistModal.css"
import { useContext, useEffect } from "react";
import SongContext from "../contexts/SongContext";
import Card2 from "../components/shared/card2";
import axios from "axios";
import { makeAuthGETReq } from "../utils/serverHelper";

export default function QueuePlaylistModal(){
    const { queue, setQueue, setCurrentSong } = useContext(SongContext);

    

    const playSound = (song) => {
      setCurrentSong(song);
  };

    return (
        <div className="QueuePlaylistModal">
            <h3>Queue</h3>
            {queue.length > 0 ? (
                queue.map((item, index) => {
                    // Conditional check for track existence
                    if (!item.songId || !item.songId.track) {
                        return null;  
                    }
                    return (
                        <Card2 key={index} info={item.songId} playSound={() => playSound(item.songId)} />
                    );
                })
            ) : (
                <p>No songs in the queue.</p>
            )}
        </div>
    );
}

