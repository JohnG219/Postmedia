const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReplySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});


const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [CommentSchema],
    replies: [ReplySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
