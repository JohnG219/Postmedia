import "./post.css";
import { MoreVert } from "@material-ui/icons";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [comment, setComments] = useState("");
  const [hoveredComment, setHoveredComment] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentUsers, setCommentUsers] = useState([]);
  const [likedUsers, setLikedUsers] = useState([]);
  const [showLikedUsers, setShowLikedUsers] = useState(false);
  const [reply, setReply] = useState("");
  const [replyUsers, setReplyUsers] = useState([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [hoveredReply, setHoveredReply] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [commentRepliesCount, setCommentRepliesCount] = useState({});

  useEffect(() => {
    const fetchReplyUsersData = async () => {
      try {
        const usersData = await Promise.all(
          post.replies.map(async (reply) => {
            const res = await axios.get(`/users?userId=${reply.userId}`);
            return res.data;
          })
        );
        setReplyUsers(usersData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReplyUsersData();
  }, [post.replies]);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        const response = await axios.get(`/posts/${post._id}/liked-users`);
        setLikedUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (showLikedUsers) {
      fetchLikedUsers();
    }
  }, [showLikedUsers, post._id]);

  const toggleLikedUsers = () => {
    setShowLikedUsers(!showLikedUsers);
  };

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?userId=${post.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

  useEffect(() => {
    const getCommentUsersData = async () => {
      try {
        const usersData = await Promise.all(
          post.comments.map(async (comment) => {
            const res = await axios.get(`/users?userId=${comment.userId}`);
            return res.data;
          })
        );
        setCommentUsers(usersData);
      } catch (err) {
        console.log(err);
      }
    };
    getCommentUsersData();
  }, [post.comments]);

  useEffect(() => {
    const fetchReplyUsersData = async () => {
      try {
        const usersData = await Promise.all(
          post.replies.map(async (reply) => {
            const res = await axios.get(`/users?userId=${reply.userId}`);
            return res.data;
          })
        );
        setReplyUsers(usersData);
        const repliesCount = {};
        post.comments.forEach((comment) => {
          const count = post.replies.filter(
            (reply) => reply.commentId === comment._id
          ).length;
          repliesCount[comment._id] = count;
        });
        setCommentRepliesCount(repliesCount);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReplyUsersData();
  }, [post.replies, post.comments]);

  const toggleDeleteConfirmation = () => {
    setShowDeleteConfirmation(!showDeleteConfirmation);
  };

  //delete post
  const deletePost = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, {
        data: { userId: currentUser._id },
      });
      const updatedNotifications = currentUser.notifications.filter(
        (notification) => {
          if (
            notification.type === "like" ||
            (notification.type === "comment" &&
              (notification.postId === post._id ||
                post.comments.some(
                  (comment) => comment._id === notification.commentId
                )))
          ) {
            return false;
          }
          return true;
        }
      );
      currentUser.notifications = updatedNotifications;
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  //delete reply
  const deleteReplyHandler = async (replyId) => {
    try {
      const response = await axios.delete(
        `/posts/${post._id}/reply/${replyId}`,
        {
          data: { userId: currentUser._id },
        }
      );
      if (response.status === 200) {
        const updatedReplies = post.replies.filter(
          (reply) => reply._id !== replyId
        );
        post.replies = updatedReplies;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //add a comment
  const commentHandler = async () => {
    console.log("Comment handler clicked!");
    if (comment.trim() === "") return;
    try {
      const response = await axios.put(`/posts/${post._id}/comment`, {
        userId: currentUser._id,
        text: comment,
        username: currentUser.username,
      });
      setComments("");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  //delete
  const deleteCommentHandler = async (commentId) => {
    try {
      const response = await axios.delete(
        `/posts/${post._id}/comment/${commentId}`,
        {
          data: { userId: currentUser._id },
        }
      );

      if (response.status === 200) {
        const updatedComments = post.comments.filter(
          (comment) => comment._id !== commentId
        );
        setComments([...updatedComments]);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const replyHandler = async (commentId) => {
    try {
      const response = await axios.post(`/posts/${post._id}/reply`, {
        userId: currentUser._id,
        text: reply,
        username: currentUser.username,
        commentId: commentId,
      });
      setReply("");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleReplies = (commentId) => {
    if (commentRepliesCount[commentId] > 0) {
      setShowReplies((prevShowReplies) => ({
        ...prevShowReplies,
        [commentId]: !prevShowReplies[commentId],
      }));
    }
  };

  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            <div
              className={`deleteConfirmation ${
                showDeleteConfirmation ? "active" : ""
              }`}
            >
              <MoreVert onClick={toggleDeleteConfirmation} />
              {showDeleteConfirmation && (
                <div className="deleteConfirmButtons">
                  <button className="deleteConfirmButton" onClick={deletePost}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={PF + post.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span
              className="postLikeCounter"
              onClick={toggleLikedUsers}
              style={{ cursor: "pointer" }}
            >
              {like} {like === 1 ? "like" : "likes"}
            </span>
            {showLikedUsers && (
              <div className={`likedUsers ${showLikedUsers ? "active" : ""}`}>
                <div className="scrollable-contents123">
                  <div className="closeIconlikeuser" onClick={toggleLikedUsers}>
                    <CloseIcon />
                  </div>
                  <p id="likedby">Liked by:</p>
                  {likedUsers.map((likedUser) => (
                    <div key={likedUser._id} className="likedUser">
                      <Link to={`/profile/${likedUser.username}`}>
                        <img
                          className="likedUserImg"
                          src={
                            likedUser.profilePicture
                              ? PF + likedUser.profilePicture
                              : PF + "person/noAvatar.png"
                          }
                          alt={likedUser.username}
                        />
                      </Link>
                      <span className="likedUsername">
                        {likedUser.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="postBottomRight">
            <div className="postCommentInteraction">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComments(e.target.value)}
              />
              <button onClick={commentHandler}>Enter</button>
            </div>
          </div>
          <span
            className="postCommentText"
            onClick={() => setShowComments(!showComments)}
          >
            {post.comments.length} comments
          </span>
        </div>
        <div className="commentinline">
          {showComments &&
            post.comments.map((comment, index) => (
              <div
                key={index}
                className={`comment ${
                  hoveredComment === index ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredComment(index)}
                onMouseLeave={() => setHoveredComment(null)}
              >
                <div className="commentContent">
                  <Link to={`/profile/${comment.username}`}>
                    <img
                      className="commentProfileImg"
                      src={
                        commentUsers[index]?.profilePicture
                          ? PF + commentUsers[index].profilePicture
                          : PF + "person/noAvatar.png"
                      }
                      alt=""
                    />
                  </Link>
                  <strong>{comment.username}</strong>: {comment.text}
                  {(currentUser._id === comment.userId ||
                    currentUser._id === post.userId) && (
                    <DeleteIcon
                      className={`deleteCommentIcon ${
                        hoveredComment === index ? "hovered" : ""
                      }`}
                      onClick={() => deleteCommentHandler(comment._id)}
                    />
                  )}
                </div>
                {replyingToCommentId === comment._id ? (
                  <button
                    className="replyhovv"
                    onClick={() => setReplyingToCommentId(null)}
                  >
                    Close
                  </button>
                ) : (
                  <button
                    className="replyhovv"
                    onClick={() => setReplyingToCommentId(comment._id)}
                  >
                    Reply
                  </button>
                )}
                <button
                  className="repliestoggle"
                  onClick={() => toggleReplies(comment._id)}
                >
                  {commentRepliesCount[comment._id] > 0
                    ? showReplies[comment._id]
                      ? "Hide Replies"
                      : "Show Replies"
                    : null}
                </button>
                <span className="replyCount">
                  {commentRepliesCount[comment._id] > 0 && (
                    <span>{commentRepliesCount[comment._id]} replies</span>
                  )}
                </span>
                {showReplies[comment._id] && (
                  <div className="postReplies">
                    {post.replies
                      .filter((reply) => reply.commentId === comment._id)
                      .map((reply) => (
                        <div
                          key={reply._id}
                          className="postReply"
                          onMouseEnter={() => setHoveredReply(reply._id)}
                          onMouseLeave={() => setHoveredReply(null)}
                        >
                          <div className="postReplyContent">
                            <Link to={`/profile/${reply.username}`}>
                              <img
                                className="replyProfileImg"
                                src={
                                  replyUsers.find(
                                    (user) => user._id === reply.userId
                                  )?.profilePicture
                                    ? PF +
                                      replyUsers.find(
                                        (user) => user._id === reply.userId
                                      )?.profilePicture
                                    : PF + "person/noAvatar.png"
                                }
                                alt=""
                              />
                            </Link>
                            <strong>{reply.username}</strong>: {reply.text}
                            {(currentUser._id === reply.userId ||
                              currentUser._id === post.userId) &&
                              (hoveredReply === reply._id ||
                                replyingToCommentId === comment._id) && (
                                <DeleteIcon
                                  className="deleteReplyIcon"
                                  onClick={() => deleteReplyHandler(reply._id)}
                                  style={{ fontSize: "20px" }}
                                />
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {replyingToCommentId === comment._id && (
                  <div className="postReplyInteraction">
                    <input
                      type="text"
                      placeholder="Reply to comment..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                      className="addreply"
                      onClick={() => replyHandler(comment._id)}
                    >
                      Add Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
