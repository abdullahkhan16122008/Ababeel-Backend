const Comment = require('../models/comment.js');
const Post = require('../models/posts.js');
const Reply = require('../models/replies.js');
let cloudinary = require('cloudinary').v2;


let postController = async (req, res) => {

    let { type, userId, caption, hashtags, visibility, location, username, profilePicture } = req.body;

    // Check file exists
    if (!req.files || !req.files.media) {
        return res.status(400).json({ message: "Media file is required!" });
    }

    const media = req.files.media;

    let mediaUrl;

    try {
        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(media.tempFilePath, {
            folder: "posts",
            resource_type:
                type === "video" || type === "reel"
                    ? "video"
                    : "image"
        });

        mediaUrl = result.secure_url;

    } catch (err) {
        return res.status(400).json({
            message: `Post type is ${
                type === "video" || type === "reel" ? "Reel" : "Image"
            }, so upload a valid ${type === "video" || type === "reel" ? "Reel/video" : "Image"}.`
        });
    }

    // Save post in DB
    try {
        let newPost = new Post({
            type,
            userId,
            caption,
            mediaUrl,
            hashtags,
            visibility,
            location,
            username,
            profilePicture
        });

        await newPost.save();

        return res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error saving post to database",
            error: err.message
        });
    }
};

let getPostsController = async (req, res) => {
    // Logic to get posts
    try {
        let allPosts = await Post.find();
        res.status(200).json({ posts: allPosts });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
};
let getReelsController = async (req, res) => {
    // Logic to get posts
    try {
        let reels = await Post.find({type: 'reel'});
        res.status(200).json({ reels });
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
            return res.status(201).json({success: false});
        }
        post.likes.push({ username, profilePicture });
        await post.save();
        res.status(200).json({ likes: post.likes, success: true });
    } catch (err) {
        res.status(203).json({ message: 'Error liking post' });
    }
};

let dislikePostController = async (req, res) => {
    // Logic to dislike a post
    let { postId, username, profilePicture } = req.body;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(201).json({ message: 'Post not found' });
        }
        post.likes = post.likes.filter(like => {
            like.username !== username
            like.profilePicture !== profilePicture
        });
        await post.save();
        res.status(200).json({ likes: post.likes, success: true });
    } catch (err) {
        res.status(203).json({ message: 'Error disliking post', success: false });
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

let replyCommentController = async (req, res) => {
    try {
        const { commentId, replyTo, username, profilePicture, text } = req.body;

        let replyComment = new Reply({ commentId, replyTo, username, profilePicture, text });

        await replyComment.save();
        return res.status(201).json({
            // message: "Reply added successfully",
            replyComment,
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error adding reply", error: err });
    }
};

let likeCommentController = async (req, res) => {
    try {
        const { commentId, username } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.likes.some(like => like.username === username)) {
            return res.status(200).json({ message: "Comment already liked", success: false });
        }
        comment.likes.push({ username });
        await comment.save();
        return res.status(201).json({
            // message: "Comment liked successfully",
            comment,
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error liking comment", error: err });
    }
};

let dislikeCommentController = async (req, res) => {
    try {
        const { commentId, username } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        comment.likes = comment.likes.filter(like => like.username !== username);
        await comment.save();
        return res.status(201).json({
            // message: "Comment disliked successfully",
            comment,
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error disliking comment", error: err });
    }
};

let likeReplyController = async (req, res) => {
    let { replyId, username } = req.body;
    try {
        let reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }
        if (reply.likes.some(like => like.username === username)) {
            return res.status(200).json({ message: "Reply already liked", success: false });
        }
        reply.likes.push({ username });
        await reply.save();
        return res.status(201).json({
            // message: "Reply liked successfully",
            reply,
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error liking reply", error: err });
    }
};

let dislikeReplyController = async (req, res) => {
    let { replyId, username } = req.body;
    try {
        let reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }
        reply.likes = reply.likes.filter(like => like.username !== username);
        await reply.save();
        return res.status(201).json({
            // message: "Reply disliked successfully",
            reply,
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error disliking reply", error: err });
    }
};

let deleteCommentController = async (req, res) => {
    try {
        const { commentId } = req.body;
        await Comment.findByIdAndDelete(commentId);
        return res.status(201).json({
            message: "Comment deleted successfully",
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error deleting comment", error: err });
    }
};

let deleteReplyController = async (req, res) => {
    try {
        const { replyId } = req.body;
        await Reply.findByIdAndDelete(replyId);
        return res.status(201).json({
            message: "Reply deleted successfully",
            success: true
        });
    } catch (err) {
        return res.status(203).json({ message: "Error deleting reply", error: err });
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
    getPostLikesController,
    getReelsController,
    dislikePostController,
    replyCommentController,
    likeCommentController,
    dislikeCommentController,
    likeReplyController,
    dislikeReplyController,
    deleteCommentController,
    deleteReplyController
};