import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import "./home.css";
import Messenger from "../messenger/Messenger";
import { useState } from "react";

export default function Home() {
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const toggleMessenger = () => {
    setIsMessengerVisible(!isMessengerVisible);
  };

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <Feed />
        <Rightbar />
        <div
          className={`overlaymessenger ${isMessengerVisible ? "visible" : ""}`}
        >
          {isMessengerVisible && <Messenger />}
        </div>
      </div>

      <button
        className={`showMessengerButton ${isMessengerVisible ? "visible" : ""}`}
        onClick={toggleMessenger}
      >
        <img className="Messengericon" src={`${PF}Messenger.svg`} alt="" />
      </button>
    </>
  );
}
