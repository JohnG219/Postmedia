import "./messenger.css";
import { EmojiEmotions, Send } from "@material-ui/icons";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import DeleteIcon from "@material-ui/icons/Delete";
import Home from "../home/Home";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function Messenger() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
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

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchUsers = async () => {
    try {
      const res = await axios.get("/users/search?username=" + searchTerm);
      setSearchResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const startConversationWithUser = async (selectedUser) => {
    try {
      const existingConversation = conversations.find((c) =>
        c.members.includes(selectedUser._id)
      );
      if (existingConversation) {
        setCurrentChat(existingConversation);
      } else {
        const newConversation = await axios.post("/conversations", {
          senderId: user._id,
          receiverId: selectedUser._id,
        });
        setCurrentChat(newConversation.data);
        setConversations([...conversations, newConversation.data]);
      }
      setSearchResults([]);
      setSearchTerm("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchUsers();
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This conversation will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Confirm",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/conversations/${conversationId}`);
          const updatedConversations = conversations.filter(
            (c) => c._id !== conversationId
          );
          setConversations(updatedConversations);
        } catch (error) {
          console.error("Error deleting conversation:", error);
        }
      }
    });
  };

  return (
    <>
      <div className="messengerContainer">
        <div className="messenger">
          <div className="chatMenu">
            <div className="chatMenuWrapper">
              <input
                placeholder="Search for users"
                className="chatMenuInput"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={handleEnterKeyPress}
              />
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => startConversationWithUser(user)}
                  className="userListItem"
                >
                  <img
                    className="userLiistImg12"
                    src={
                      user?.profilePicture
                        ? PF + user.profilePicture
                        : PF + "person/noAvatar.png"
                    }
                    alt=""
                  />
                  <p className="postcenttel">
                    <p id="nameuseeer">{user.username}</p> start conversation.
                  </p>
                </div>
              ))}
              {conversations.map((c) => (
                <div key={c._id} onClick={() => setCurrentChat(c)}>
                  <Conversation
                    conversation={c}
                    currentUser={user}
                    onDelete={handleDeleteConversation}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="chatBox">
            <div className="chatBoxWrapper">
              {currentChat ? (
                <>
                  <div className="chatBoxTop">
                    {messages.map((m) => (
                      <div key={m._id} ref={scrollRef}>
                        <Message message={m} own={m.sender === user._id} />
                      </div>
                    ))}
                  </div>
                  <div className="chatBoxBottom">
                    <textarea
                      className="chatMessageInput"
                      placeholder="Send a message..."
                      onChange={(e) => setNewMessage(e.target.value)}
                      value={newMessage}
                    ></textarea>
                    <button className="chatSubmitButton" onClick={handleSubmit}>
                      <Send className="sendIcon" />
                    </button>
                    <div
                      className="shareOption"
                      onClick={() => setPickerVisible(!isPickerVisible)}
                    >
                      <EmojiEmotions
                        htmlColor="goldenrod"
                        className="shareIcon"
                      />
                    </div>
                    <span className="shareOptionText123">
                      {" "}
                      {currentEmoji && (
                        <button
                          className="emojicopybutton12"
                          onClick={handleCopyEmoji}
                        >
                          Copy Emoji
                        </button>
                      )}
                    </span>
                    <div className="emojipast12">
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
                  </div>
                </>
              ) : (
                <span className="noConversationText">
                  Start a conversation with your partner, family, and friends.
                </span>
              )}
            </div>
          </div>
          <div className="chatOnline">
            <div className="chatOnlineWrapper">
              <ChatOnline
                onlineUsers={onlineUsers}
                currentId={user._id}
                setCurrentChat={setCurrentChat}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
