const Comment = require('../models/comment.js');
const Post = require('../models/posts.js');
let cloudinary = require('cloudinary').v2;


let postController = async (req, res) => {
    // Post creation logic here
    let { type, userId, caption, hashtags, visibility, location } = req.body;

    const media = req.files.media;

    // file null bhi ho sakti hai (text post)
    let mediaUrl = await cloudinary.uploader.upload(media.tempFilePath, {
        folder: 'posts',
        resource_type: (req.body.type === "video" || req.body.type === "reel")
            ? "video"
            : "image"
    }).then((result) => {
        return result.secure_url;
    }).catch((err) => {
        return res.status(201).json({ message: `Post Type is ${(type === 'video' || type === 'reel') ? `Reel` : 'Image'} so Upload a ${(type === 'video' || type === 'reel') ? `Reel` : 'Image'}` });

    });

    let newPost = new Post({
        type,
        userId,
        caption,
        mediaUrl,
        hashtags,
        visibility,
        location,
        createdAt: new Date()
    });
    try {
        await newPost.save();
        res.status(201).json({ message: 'Post created successfully' });
    } catch (err) {
        res.status(201).json({ message: 'Error creating post' });
    }
};

let getPostsController = async (req, res) => {
    // Logic to get posts
    try {
        let allPosts = await Post.find();
        res.status(200).json(allPosts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

let likePostController = async (req, res) => {
    // Logic to like a post
    let { postId, username, profilePicture } = req.body;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(201).json({ message: 'Post not found' });
        }
        if (post.likes.includes(username)) {
            return res.status(201).json({ message: 'User has already liked this post' });
        }
        post.likes.push({ username, profilePicture });
        await post.save();
        res.status(200).json({ message: 'Post liked successfully', likes: post.likes });
    } catch (err) {
        res.status(203).json({ message: 'Error liking post' });
    }
};

let getPostLikesController = async (req, res) => {
    // Logic to like a post
    let { postId, username } = req.body;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(201).json({ message: 'Post not found' });
        }
        if (!post.likes.includes(username)) {
            return res.status(201).json({ likes: post.likes, liked: false });
        }
        return res.status(200).json({ liked: true, likes: post.likes });
    } catch (err) {
        res.status(203).json({ message: `Error ${err}` });
    }
};

let commentPostController = async (req, res) => {
try {
    const { postId, username, profilePicture, text } = req.body;

    const comment = await Comment.create({
      postId,
      username,
      profilePicture,
      text
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
      success: true
    });
  } catch (err) {
    return res.status(203).json({ message: "Error adding comment", error: err });
  }
};

let getCommentController = async (req, res) => {
try {
    const { postId } = req.body;

    const comments = await Comment.find({
      postId
    });

    return res.status(201).json({
      comments,
      success: true
    });
  } catch (err) {
    return res.status(203).json({ message: "Error getting comments", error: err });
  }
};

let editPostController = async (req, res) => {
    // Logic to edit a post
    let { postId, caption, hashtags, visibility, location } = req.body;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.caption = caption || post.caption;
        post.hashtags = hashtags || post.hashtags;
        post.visibility = visibility || post.visibility;
        post.location = location || post.location;
        await post.save();
        res.status(200).json({ message: 'Post updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating post' });
    }

};
let deletePostController = async (req, res) => {
    // Logic to delete a post
    let { postId } = req.body;
    try {
        let post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting post' });
    }
};


module.exports = {
    postController,
    getPostsController,
    likePostController,
    commentPostController,
    editPostController,
    deletePostController,
    getCommentController,
    getPostLikesController
};