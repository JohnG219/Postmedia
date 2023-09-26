import "./topbar.css";
import {
  Search,
  Person,
  Chat,
  Notifications,
  Home,
  Wifi,
} from "@material-ui/icons";
import { Link, useHistory } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

import NotificationsDropdown from "../notificationsdropdown/NotificationsDropdown";
import axios from "axios";
import Swal from "sweetalert2";
export default function Topbar({ username }) {
  const { user, dispatch, notifications } = useContext(AuthContext);
  const history = useHistory();
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLogoutDropdownOpen, setIsLogoutDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] =
    useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [noResults, setNoResults] = useState(false); 

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/users/search?username=${searchQuery}`);
      setSearchResults(response.data);
      setNoResults(response.data.length === 0);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    if (user) {
      dispatch({ type: "LOGOUT" });
    }
  };


  const handleNotificationsClick = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  useEffect(() => {
    const newNotificationCount = user.notifications.filter(
      (notification) => !notification.isRead
    ).length;
    setNotificationCount(newNotificationCount);
    setShowNotifications(newNotificationCount > 0);
  }, [user.notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/users/${user._id}/notifications`);
        const newNotificationCount = response.data.length;
        console.log("New notification count:", newNotificationCount);
        setNotificationCount(newNotificationCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [user._id]);

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">PostMedia</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friends and users"
            className="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        {searchResults.length > 0 && (
          <ul className="searchResults">
            {searchResults.map((result) => (
              <li key={result._id}>
                <Link
                  to={`/profile/${result.username}`}
                  className="searchResultLink"
                >
                  <img
                    src={
                      result.profilePicture
                        ? PF + result.profilePicture
                        : PF + "person/noAvatar.png"
                    }
                    alt="Profile"
                    className="searchResultImage"
                  />
                  {result.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {noResults && (
          <p className="noResultsMessage">User not found.</p> // Render the message
        )}
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" className="topbarLinkHome">
            <Home style={{ fontSize: "35px" }} />
          </Link>
        </div>
        <div className="topbarIcons">
          <div
            className="topbarIconItem"
            onClick={() =>
              setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)
            }
          >
            <Notifications />
            {notificationCount > 0 && (
              <span className="topbarIconBadge">{notificationCount}</span>
            )}
            {isNotificationsDropdownOpen && <NotificationsDropdown />}
          </div>

          <div
            className="topbarIconItem"
            onClick={() => setIsLogoutDropdownOpen(!isLogoutDropdownOpen)}
          >
            <Person />
            {isLogoutDropdownOpen && (
              <div className="logoutDropdown">
                <span className="topbarLink" onClick={() => handleLogout()}>
                  LOGOUT
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
