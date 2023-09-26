import "./message.css";
import { format } from "timeago.js";
import { useEffect, useState } from "react";
import axios from "axios";
import DeleteIcon from "@material-ui/icons/Delete";

export default function Message({ message, own }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios(`/users?userId=${message.sender}`);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUserData();
  }, [message.sender]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/messages/${message._id}`);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={
            user?.profilePicture
              ? PF + user.profilePicture
              : PF + "person/noAvatar.png"
          }
          alt=""
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
      {own && (
        <button className="deleteButton" onClick={handleDelete}>
          <DeleteIcon />
        </button>
      )}
    </div>
  );
}
