const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//create new post
router.post("/", async (req, res) => {
  const newPost = new Post({
    userId: req.body.userId,
    desc: req.body.desc,
    emoji: req.body.emoji, 
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});


//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }
    if (post.userId.toString() !== req.body.userId) {
      return res.status(403).json("You can delete only your post");
    }
    const user = await User.findById(post.userId);
    const notificationsToDelete = [];
    post.comments.forEach((comment) => {
      const commentNotification = user.notifications.find(
        (notification) =>
          notification.type === "comment" &&
          notification.commentId === comment._id.toString()
      );
      if (commentNotification) {
        notificationsToDelete.push(commentNotification._id);
      }
    });
    post.likes.forEach((likeUserId) => {
      const likeNotification = user.notifications.find(
        (notification) =>
          notification.type === "like" &&
          notification.userId.toString() === likeUserId.toString()
      );
      if (likeNotification) {
        notificationsToDelete.push(likeNotification._id);
      }
    });
    await post.deleteOne();
    user.notifications = user.notifications.filter(
      (notification) => !notificationsToDelete.includes(notification._id)
    );
    await user.save();

    res
      .status(200)
      .json("The post and related notifications have been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//part 2 delete
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Express route to remove notifications by IDs
router.put("/:id/remove-notifications", async (req, res) => {
  const userId = req.params.id;
  const { notificationsToDelete } = req.body;
  try {
    const user = await User.findById(userId);
    user.notifications = user.notifications.filter((notification) => {
      return !notificationsToDelete.some((notificationToDelete) =>
        notification._id.equals(notificationToDelete._id)
      );
    });
    await user.save();
    res.status(200).json("Notifications removed successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like or dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId.toString() !== req.body.userId) {
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        const newNotification = {
          type: "like",
          userId: req.body.userId,
        };
        await User.findByIdAndUpdate(post.userId, {
          $push: { notifications: newNotification },
        });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      }
    } else {
      res.status(403).json("You can't like or dislike your own post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get User Like
router.get("/:id/liked-users", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const likedUsersData = await User.find({ _id: { $in: post.likes } });
    res.status(200).json(likedUsersData);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//add Comment
router.put("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const newComment = {
      userId: req.body.userId,
      text: req.body.text,
      username: req.body.username,
    };
    post.comments.push(newComment);
    await post.save();
    if (post.userId.toString() !== req.body.userId) {
      const newNotification = {
        type: "comment",
        userId: req.body.userId,
      };
      await User.findByIdAndUpdate(post.userId, {
        $push: { notifications: newNotification },
      });
    }

    res.status(200).json(newComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// user delete comment
router.delete("/:id/comment/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const commentId = req.params.commentId;

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.userId.toString() !== req.body.userId &&
      post.userId.toString() !== req.body.userId
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comment" });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//add reply
router.post("/:id/reply", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const newReply = {
      userId: req.body.userId,
      text: req.body.text,
      username: req.body.username,
      commentId: req.body.commentId, 
    };
    post.replies.push(newReply);
    await post.save();
    res.status(200).json(newReply);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a reply
router.delete("/:postId/reply/:replyId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const replyId = req.params.replyId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const reply = post.replies.find(
      (reply) => reply._id.toString() === replyId
    );
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }
    if (
      reply.userId.toString() !== req.body.userId &&
      post.userId.toString() !== req.body.userId
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reply" });
    }
    post.replies.pull(replyId);
    await post.save();
    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Allowed user owner post Delete a reply
router.delete("/:id/reply/:replyId", async (req, res) => {
  try {
    const postId = req.params.id;
    const replyId = req.params.replyId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const reply = post.replies.find(
      (reply) => reply._id.toString() === replyId
    );
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }
    if (req.body.userId === post.userId || req.body.userId === reply.userId) {
      post.replies.pull(replyId);
      await post.save();
      res.status(200).json({ message: "Reply deleted successfully" });
    } else {
      return res
        .status(403)
        .json({ message: "You can only delete your own reply" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      await Post.deleteMany({ userId: user._id });
      await Post.updateMany(
        { "comments.userId": user._id },
        { $pull: { comments: { userId: user._id } } }
      );
      await Post.updateMany(
        { likes: user._id },
        { $pull: { likes: user._id } }
      );
      await user.remove();
      res.status(200).json("Account and related data have been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//delete notifications
router.delete("/notifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { notificationIdsToDelete } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.notifications = user.notifications.filter((notification) => {
      return !notificationIdsToDelete.includes(notification._id.toString());
    });
    await user.save();
    res.status(200).json({ message: "Notifications removed successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete all notifications mark all as red
router.delete("/:userId/notifications/all", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.notifications = [];
    await user.save();
    res
      .status(200)
      .json({
        message: "All notifications marked as read and deleted successfully",
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get notifications
router.get("/notifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

//user profilePicture post
router.post("/:id/profilePicture", async (req, res) => {
  const userId = req.params.id;
  const { profilePicture } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { profilePicture });
    res.status(200).json("Profile picture updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to update profile picture");
  }
});

module.exports = router;
