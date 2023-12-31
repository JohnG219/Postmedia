const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Post = require("../models/Post");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});


//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user._id.toString() !== currentUser._id.toString()) {
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          const newNotification = {
            type: "follow",
            userId: req.body.userId,
          };
          await user.updateOne({ $push: { notifications: newNotification } });
          res.status(200).json("User has been followed");
        } else {
          res.status(403).json("You already follow this user");
        }
      } else {
        res.status(403).json("You can't follow yourself");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

// search users
router.get("/search", async (req, res) => {
  const username = req.query.username;
  try {
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//followers list
router.get("/followers/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const followers = await Promise.all(
      user.followers.map((followerId) => {
        return User.findById(followerId);
      })
    );
    let followersList = [];
    followers.map((follower) => {
      const { _id, username, profilePicture } = follower;
      followersList.push({ _id, username, profilePicture });
    });
    res.status(200).json(followersList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE user and associated data
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const userIdToDelete = req.params.id;
      const userToDelete = await User.findById(userIdToDelete);
      if (!userToDelete) {
        return res.status(404).json("User not found");
      }
      await User.updateMany(
        {},
        { $pull: { notifications: { userId: userIdToDelete } } }
      );
      await Post.deleteMany({ userId: userIdToDelete });
      await Post.updateMany(
        { "comments.userId": userIdToDelete },
        { $pull: { comments: { userId: userIdToDelete } } }
      );
      await Post.updateMany(
        { likes: userIdToDelete },
        { $pull: { likes: userIdToDelete } }
      );
      await User.updateMany(
        { followings: userIdToDelete },
        { $pull: { followings: userIdToDelete } }
      );
      await User.updateMany(
        { followers: userIdToDelete },
        { $pull: { followers: userIdToDelete } }
      );
      await User.findByIdAndDelete(userIdToDelete);
      res.status(200).json("Account and related data have been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("You don't have permission to delete the user!");
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
    res.status(200).json({ message: "All notifications marked as read and deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});


//get notifications
router.get("/:userId/notifications", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json(err);
  }
});

module.exports = router;
