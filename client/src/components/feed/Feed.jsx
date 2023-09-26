import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = username
          ? await axios.get("/posts/profile/" + username)
          : await axios.get("posts/timeline/" + user._id);
        setPosts(
          res.data.sort((p1, p2) => {
            return new Date(p2.createdAt) - new Date(p1.createdAt);
          })
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [username, user._id]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share />}
        {isLoading ? (
          <p id="youowneruser">Loading...</p>
        ) : posts.length === 0 ? (
          username === user.username ? (
            <p id="youowneruser">You don't have any posts yet.</p>
          ) : (
            <p id="youowneruser">
              <p id="nopostuser">
                {username ? `${username} has no posts yet.` : "No post yet!"}
              </p>
            </p>
          )
        ) : (
          posts.map((p) => <Post key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}
