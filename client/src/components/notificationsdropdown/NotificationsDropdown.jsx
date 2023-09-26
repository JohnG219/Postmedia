import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./notificationsdropdown.css";
import {
 Check,
} from "@material-ui/icons";

function NotificationsDropdown() {
  const { user, dispatch } = useContext(AuthContext);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const fetchData = async () => {
    try {
      const response = await axios.get(`/users/${user._id}/notifications`);
      dispatch({ type: "SET_NOTIFICATIONS", payload: response.data });

      const userIdsToFetch = response.data
        .filter((notification) => notification.userId !== user._id)
        .map((notification) => notification.userId);

      const userPromises = userIdsToFetch.map(async (userId) => {
        if (!usernames[userId]) {
          const userData = await axios.get(`/users?userId=${userId}`);
          return {
            userId: userId,
            username: userData.data.username,
            profilePicture: userData.data.profilePicture,
          };
        }
        return null;
      });

      const newUserData = await Promise.all(userPromises);
      const newUsernameMap = {};
      const newProfilePicturesMap = {};
      newUserData.forEach((data) => {
        if (data) {
          newUsernameMap[data.userId] = data.username;
          newProfilePicturesMap[data.userId] = data.profilePicture;
        }
      });
      setUsernames((prevUsernames) => ({
        ...prevUsernames,
        ...newUsernameMap,
      }));
      setProfilePictures((prevProfilePictures) => ({
        ...prevProfilePictures,
        ...newProfilePicturesMap,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [user._id, dispatch]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/users/notifications/${user._id}`, {
        data: { notificationIdsToDelete: [notificationId] },
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const newNotificationCount = user.notifications.filter(
    (notification) => !notification.isRead && notification.userId !== user._id
  ).length;
  if (!user.notifications || user.notifications.length === 0) {
    return (
      <div className="notificationsDropdown">
        <div className="donthave">
          <p id="parapgr">You don't have any notifications.</p>
        </div>
      </div>
    );
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axios.delete(`/users/${user._id}/notifications/all`);
      fetchData();
      window.location.reload();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="notificationsDropdown">
      {user.notifications &&
        user.notifications.map(
          (notification) =>
            notification.userId !== user._id && (
              <div
                key={notification._id}
                className="notificationItem"
                onClick={() => handleDeleteNotification(notification._id)}
              >
                <div className="notificationItemContent">
                  {notification.type === "like" && (
                    <>
                      <img
                        className="notificationProfilePicture"
                        src={
                          profilePictures[notification.userId]
                            ? PF + profilePictures[notification.userId]
                            : PF + "person/noAvatar.png"
                        }
                        alt=""
                      />
                      <p className="postcenttel">
                        <p id="nameuseeer">{usernames[notification.userId]}</p>{" "}
                        liked your post.
                      </p>
                    </>
                  )}
                  {notification.type === "follow" && (
                    <>
                      <img
                        className="notificationProfilePicture"
                        src={
                          profilePictures[notification.userId]
                            ? PF + profilePictures[notification.userId]
                            : PF + "person/noAvatar.png"
                        }
                        alt=""
                      />
                      <p className="postcenttel">
                        <p id="nameuseeer">{usernames[notification.userId]}</p>{" "}
                        started following you.
                      </p>
                    </>
                  )}
                  {notification.type === "comment" && (
                    <>
                      <img
                        className="notificationProfilePicture"
                        src={
                          profilePictures[notification.userId]
                            ? PF + profilePictures[notification.userId]
                            : PF + "person/noAvatar.png"
                        }
                        alt=""
                      />
                      <p className="postcenttel">
                        <p id="nameuseeer">{usernames[notification.userId]}</p>{" "}
                        commented on your post.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )
        )}
      <div className="elementmarkaasread">
        <button className="markAllAsReadButton" onClick={handleMarkAllAsRead}>
          <Check /> all as read
        </button>
      </div>
      {newNotificationCount > 0 && (
        <span className="topbarIconBadgg123">{newNotificationCount}</span>
      )}
    </div>
  );
}

export default NotificationsDropdown;
