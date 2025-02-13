import { useAuth } from "../utils/authProvider";
import { Link, useNavigate } from 'react-router-dom';
import LogInBP from "../boilerplates/LogInBP";
import { useState, useEffect, useContext } from "react";
import ArtistCard from "../components/shared/artistCard";
import { makeAuthGETReq } from "../utils/serverHelper";
import {toast} from "react-toastify";
import "../public/css/followers.css";

export default function Followers(){
    const [following, setFollowing] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    useEffect(() => {
        const getData = async () => {
            try {
                const res = await makeAuthGETReq("/myfollowing");
                if (res.error) {
                    throw new Error(res.error);
                }
                console.log("Data fetched successfully:", res);
                console.log(res.data.following);
                setFollowing(res.data.following);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };

        getData();
    }, []);
    return (
        <LogInBP>
            <div className="MyFollowings">
                <h1>Followers</h1>
                {following.map((item, index) => (
                    <ArtistCard
                        key={index}
                        info={item}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />
                ))}
            </div>
        </LogInBP>
    )
}