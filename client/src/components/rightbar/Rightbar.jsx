import "./rightbar.css";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Rightbar({ user }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followers, setFollowers] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowingOverlay, setShowFollowingOverlay] = useState(false);
  const [showFollowersOverlay, setShowFollowersOverlay] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [followerSearchQuery, setFollowerSearchQuery] = useState("");
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const getFollowers = async () => {
      try {
        const followersList = await axios.get("/users/followers/" + user._id);
        setFollowers(followersList.data);
        setFollowerCount(followersList.data.length);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    getFollowers();
  }, [user]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        const friendList = await axios.get("/users/friends/" + user._id);
        setFriends(friendList.data);
        setFollowingCount(friendList.data.length);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    getFriends();
  }, [user]);

  useEffect(() => {
    const filteredUsers = friends.filter((friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filteredUsers);
  }, [searchQuery, friends]);

  useEffect(() => {
    const filteredFollowers = followers.filter((follower) =>
      follower.username
        .toLowerCase()
        .includes(followerSearchQuery.toLowerCase())
    );
    setFilteredFollowers(filteredFollowers);
  }, [followerSearchQuery, followers]);

  const toggleFollowingOverlay = () => {
    if (friends.length >= 4) {
      setShowFollowingOverlay(!showFollowingOverlay);
      if (!showFollowingOverlay) {
        setFollowingList(friends);
      }
    }
  };

  const toggleFollowersOverlay = () => {
    if (followers.length >= 4) {
      setShowFollowersOverlay(!showFollowersOverlay);
      if (!showFollowersOverlay) {
        setFollowersList(followers);
      }
    }
  };

  const HomeRightbar = () => {
    return (
      <>
        <div className="birthdayContainer">
          <img className="birthdayImg" src="assets/gift.png" alt="" />
          <span className="birthdayText">
            <b>Connecting with the World Around You</b>
          </span>
        </div>
        <img className="rightbarAd" src="assets/ad.png" alt="" />
        <h4 className="rightbarTitle">Tech Industry</h4>
        <img className="rightbarAd" src="assets/ad2.png" alt="" />
        <h4 className="rightbarTitle">Daily Life</h4>
        <img className="rightbarAd" src="assets/ad3.png" alt="" />
      </>
    );
  };

  const ProfileRightbar = () => {
    return (
      <>
        <h4 className="rightbarprofile">Profile ☏</h4>
        <div className="rightbarInfo">
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              <img className="followers" src={`${PF}work.png`} alt="" />
              Work:
            </span>
            <span className="rightbarInfoValue">{user.work}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              <img className="followers" src={`${PF}study.png`} alt="" />
              Studied:
            </span>
            <span className="rightbarInfoValue">{user.studies}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              <img className="followers" src={`${PF}live.png`} alt="" />
              Lives in:
            </span>
            <span className="rightbarInfoValue">{user.city}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              <img className="followers" src={`${PF}location.png`} alt="" />
              From:
            </span>
            <span className="rightbarInfoValue">{user.from}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              <img className="followers" src={`${PF}gender3.png`} alt="" />
              Sex:
            </span>
            <span className="rightbarInfoValue">
              {user.sex === 1 ? "Male" : user.sex === 2 ? "Female" : "-"}
            </span>
          </div>
          {user.birthdate ? (
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">
                <img className="followers" src={`${PF}birthday.png`} alt="" />
                Birthdate:
              </span>
              <span className="rightbarInfoValue">
                {formatDate(user.birthdate)}
              </span>
            </div>
          ) : (
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">
                <img className="followers" src={`${PF}birthday.png`} alt="" />
                Birthdate:
              </span>
              <span className="rightbarInfoValue"></span>
            </div>
          )}
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">
              ️{" "}
              <img
                className="followers"
                src={`${PF}relationship2.png`}
                alt=""
              />
              Relationship:
            </span>
            <span className="rightbarInfoValue">
              {user.relationship === 1
                ? "Single"
                : user.relationship === 2
                ? "Married"
                : user.relationship === 3
                ? "In a relationship"
                : "-"}
            </span>
          </div>
        </div>
        <div className="follows">
          <div className="followingss">
            <h4 className="rightbarTitle" onClick={toggleFollowingOverlay}>
              🌐Following
              <p id="followingcount">{followingCount}</p>
            </h4>
            {showFollowingOverlay ? (
              <div className="rightbarFollowingsOverlay">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="scrollable-content">
                  {filteredUsers.length === 0 ? (
                    <div className="rightbarNoFollowers">
                      {user.username === currentUser.username
                        ? "You are not following anyone."
                        : `${user.username} is not following anyone.`}
                    </div>
                  ) : (
                    filteredUsers.map((friend) => (
                      <Link
                        to={"/profile/" + friend.username}
                        style={{ textDecoration: "none" }}
                        key={friend._id}
                        onClick={() => setShowFollowingOverlay(false)}
                      >
                        <div className="followersoverlaydisplay">
                          <div className="rightbarFollowing">
                            <img
                              src={
                                friend.profilePicture
                                  ? PF + friend.profilePicture
                                  : PF + "person/noAvatar.png"
                              }
                              alt=""
                              className="rightbarFollowingImg"
                            />
                            <span className="rightbarFollowingName">
                              {friend.username}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rightbarFollowings">
                {friends.length === 0 ? (
                  <div className="rightbarNoFollowers">
                    {user.username === currentUser.username
                      ? "You are not following anyone."
                      : `${user.username} is not following anyone.`}
                  </div>
                ) : (
                  friends.slice(0, 3).map((friend) => (
                    <Link
                      to={"/profile/" + friend.username}
                      style={{ textDecoration: "none" }}
                      key={friend._id}
                    >
                      <div className="rightbarFollowing">
                        <img
                          src={
                            friend.profilePicture
                              ? PF + friend.profilePicture
                              : PF + "person/noAvatar.png"
                          }
                          alt=""
                          className="rightbarFollowingImg"
                        />
                        <span className="rightbarFollowingName">
                          {friend.username}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="follows">
            <div className="followingss">
              <h4 className="rightbarTitle" onClick={toggleFollowersOverlay}>
                <img className="followers" src={`${PF}followers.png`} alt="" />
                Followers
                <p id="followingcount">{followerCount}</p>
              </h4>
              {showFollowersOverlay ? (
                <div className="rightbarFollowingsOverlay">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={followerSearchQuery}
                    onChange={(e) => setFollowerSearchQuery(e.target.value)}
                  />
                  <div className="scrollable-content">
                    {filteredFollowers.length === 0 ? (
                      <div className="rightbarNoFollowers">
                        {user.username === currentUser.username
                          ? "You don't have any followers."
                          : `${user.username} doesn't have any followers.`}
                      </div>
                    ) : (
                      filteredFollowers.map((follower) => (
                        <Link
                          to={"/profile/" + follower.username}
                          style={{ textDecoration: "none" }}
                          key={follower._id}
                          onClick={() => setShowFollowersOverlay(false)}
                        >
                          <div className="followersoverlaydisplay">
                            <div className="rightbarFollowing">
                              <img
                                src={
                                  follower.profilePicture
                                    ? PF + follower.profilePicture
                                    : PF + "person/noAvatar.png"
                                }
                                alt=""
                                className="rightbarFollowingImg"
                              />
                              <span className="rightbarFollowingName">
                                <p className="followersnamesss">
                                  {follower.username}
                                </p>
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="rightbarFollowings">
                  {followers.length === 0 ? (
                    <div className="rightbarNoFollowers">
                      {user.username === currentUser.username
                        ? "You don't have any followers."
                        : `${user.username} doesn't have any followers.`}
                    </div>
                  ) : (
                    followers.slice(0, 3).map((follower) => (
                      <Link
                        to={"/profile/" + follower.username}
                        style={{ textDecoration: "none" }}
                        key={follower._id}
                      >
                        <div className="rightbarFollowing">
                          <img
                            src={
                              follower.profilePicture
                                ? PF + follower.profilePicture
                                : PF + "person/noAvatar.png"
                            }
                            alt=""
                            className="rightbarFollowingImg"
                          />
                          <span className="rightbarFollowingName">
                            <p className="followersname">{follower.username}</p>
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        {isLoading ? (
          <div>Loading...</div>
        ) : user ? (
          <ProfileRightbar />
        ) : (
          <HomeRightbar />
        )}
      </div>
    </div>
  );
}
