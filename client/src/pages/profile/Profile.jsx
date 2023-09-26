import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import EditProfile from "../../components/editprofile/EditProfile";

export default function Profile() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const username = useParams().username;
  const [followed, setFollowed] = useState(false);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseEditProfile = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    setFollowed(currentUser.followings.includes(user?._id));
  }, [currentUser.followings, user?._id]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?username=${username}`);
      setUser(res.data);
    };
    fetchUser();
  }, [username]);

  const handleClick = async () => {
    try {
      if (followed) {
        await axios.put(`/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "FOLLOW", payload: user._id });
      }
      setFollowed(!followed);
    } catch (err) {}
  };

  return (
    <>
      <Topbar />
      <div className={`profile ${isEditing ? "editing" : ""}`}>
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  user.coverPicture
                    ? PF + user.coverPicture
                    : PF + "person/noCover.png"
                }
                alt=""
              />
              <img
                className="profileUserImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span>
                {user.username !== currentUser.username && user._id && (
                  <button
                    className="rightbarFollowButton"
                    onClick={handleClick}
                  >
                    {followed ? "Unfollow" : "Follow"}
                  </button>
                )}
                {user.username === currentUser.username && (
                  <button className="editbutton" onClick={handleEditClick}>
                    Edit Profile
                  </button>
                )}
              </span>
              <span className="profileInfoDesc">{user.desc}</span>
              {isEditing && user.username === currentUser.username ? (
                <EditProfile onClose={handleCloseEditProfile} />
              ) : (
                <div className="profileRightBottom">
                  <Feed username={username} />
                  <Rightbar user={user} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
