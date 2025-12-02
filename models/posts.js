let mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["image", "video", "reel", "text"],
      default: "image"
    },

    caption: {
      type: String,
    },

    mediaUrl: {
      type: String,
      required: function () {
        return this.type !== "text";
      }
    },

    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    likes: [
      {
        username: String,
        profilePicture: String
      }
    ],

    // comments: [
    //   {
    //     userId: {
    //       type: String,
    //       // ref: "User"
    //     },
    //     text: String,
    //     createdAt: {
    //       type: Date,
    //       default: Date.now
    //     }
    //   }
    // ],

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },

    views: {
      type: Number,
      default: 0
    },

    profilePicture: {
      type: String
    },

    location: {
      type: String
    }
  },
  { timestamps: true }
);

let Post = mongoose.model("Post", postSchema);
module.exports = Post;
