let express = require('express');
let userRouter = express.Router();
let { registerController, loginController, verifyController, refreshTokenController, logoutController } = require('../controllers/authentication.controller.js');
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware.js');
const { validatePost } = require('../middlewares/post.middleware.js');
const { upload } = require('../multer/multer.js');
const {
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
} = require('../controllers/post.controller.js');
const { getProfile, getProfilePosts, updateProfile } = require('../controllers/profile.controller.js');

// Registration route
userRouter.post('/api/register', validateRegistration, registerController);
userRouter.post('/api/login', validateLogin, loginController);
userRouter.post('/api/post', postController);
userRouter.post('/api/get/posts', getPostsController);
userRouter.post('/api/get/reels', getReelsController);
userRouter.post('/api/like/post', likePostController);
userRouter.post('/api/dislike/post', dislikePostController);
userRouter.post('/api/get/post/likes', getPostLikesController);
userRouter.post('/api/comment/post', commentPostController);
userRouter.post('/api/reply/comment', replyCommentController);
userRouter.post('/api/like/comment', likeCommentController);
userRouter.post('/api/dislike/comment', dislikeCommentController);
userRouter.post('/api/like/reply', likeReplyController);
userRouter.post('/api/dislike/reply', dislikeReplyController);
userRouter.post('/api/delete/comment', deleteCommentController);
userRouter.post('/api/delete/reply', deleteReplyController);
userRouter.post('/api/get/comments', getCommentController);
userRouter.post('/api/edit/post', editPostController);
userRouter.post('/api/delete/post', deletePostController);
userRouter.post('/api/get/profile', getProfile);
userRouter.post('/api/get/profile/posts', getProfilePosts);
userRouter.post('/api/update/profile', updateProfile);
userRouter.post('/api/verify/token', verifyController);
userRouter.post('/api/refresh/token', refreshTokenController);
userRouter.post('/api/logout', logoutController);



module.exports = userRouter;