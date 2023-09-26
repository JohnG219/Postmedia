import "./share.css";
import {
  PermMedia,
  Label,
  Room,
  EmojiEmotions,
  Cancel,
} from "@material-ui/icons";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function Share() {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const desc = useRef();
  const [file, setFile] = useState(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const handleEmojiSelect = (emoji) => {
    setCurrentEmoji(emoji.native);
  };
  const handleCopyEmoji = () => {
    if (currentEmoji) {
      const tempInput = document.createElement("input");
      tempInput.value = currentEmoji;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const newPost = {
      userId: user._id,
      desc: desc.current.value,
      emoji: currentEmoji,
    };
    if (file) {
      const data = new FormData();
      const fileName = Date.now() + file.name;
      data.append("name", fileName);
      data.append("file", file);
      newPost.img = fileName;
      console.log(newPost);
      try {
        await axios.post("/upload", data);
      } catch (err) {}
    }
    try {
      await axios.post("/posts", newPost);
      setInputValue("");
      setCurrentEmoji(null);
      setFile(null);
      window.location.reload();
    } catch (err) {}
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={
              user.profilePicture
                ? PF + user.profilePicture
                : PF + "person/noAvatar.png"
            }
            alt=""
          />
          <input
            placeholder={"Share your feelings " + user.username + "."}
            className="shareInput"
            ref={desc}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {currentEmoji && (
            <button className="emojicopybutton" onClick={handleCopyEmoji}>
              Copy Emoji
            </button>
          )}
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImgContainer">
            <img className="shareImg" src={URL.createObjectURL(file)} alt="" />
            <Cancel className="shareCancelImg" onClick={() => setFile(null)} />
          </div>
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="tomato" className="shareIcon" />
              <span className="shareOptionText">Photo or Video</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <div className="shareOption">
              <Label htmlColor="blue" className="shareIcon" />
              <span className="shareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="green" className="shareIcon" />
              <span className="shareOptionText">Location</span>
            </div>
            <div
              className="shareOption"
              onClick={() => setPickerVisible(!isPickerVisible)}
            >
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="shareOptionText">Feelings</span>
            </div>
          </div>
          <div className="emojipast">
            {isPickerVisible && (
              <Picker
                data={data}
                previewPosition="none"
                onEmojiSelect={(e) => {
                  setCurrentEmoji(e.native);
                  setPickerVisible(!isPickerVisible);
                }}
              />
            )}
          </div>

          <button className="shareButton" type="submit">
            {" "}
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
