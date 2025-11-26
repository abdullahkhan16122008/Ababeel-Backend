let express = require('express');
let userRouter = express.Router();
let { registerController, loginController } = require('../controllers/authentication.controller.js');
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware.js');
const { validatePost } = require('../middlewares/post.middleware.js');
const { upload } = require('../multer/multer.js');
const { postController, getPostsController, likePostController, commentPostController, editPostController, deletePostController, getCommentController, getPostLikesController } = require('../controllers/post.controller.js');
const { getProfile, getProfilePosts, updateProfile } = require('../controllers/profile.controller.js');

// Registration route
userRouter.post('/api/register', validateRegistration, registerController);
userRouter.post('/api/login', validateLogin, loginController);
userRouter.post('/api/post', postController);
userRouter.post('/api/get/posts', getPostsController);
userRouter.post('/api/like/post', likePostController);
userRouter.post('/api/get/post/likes', getPostLikesController);
userRouter.post('/api/comment/post', commentPostController);
userRouter.post('/api/get/comments', getCommentController);
userRouter.post('/api/edit/post', editPostController);
userRouter.post('/api/delete/post', deletePostController);
userRouter.post('/api/get/profile', getProfile);
userRouter.post('/api/get/profile/posts', getProfilePosts);
userRouter.post('/api/update/profile', updateProfile);



module.exports = userRouter;