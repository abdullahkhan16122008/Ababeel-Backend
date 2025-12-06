let mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        postId: { type: String, required: true },
        username: { type: String, required: true },
        profilePicture: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1ETHj25I6ZphEu_NiXJIT42IDcuCHNVy5CnAc7mKQxA&s' },
        text: String,
        likes: [{
                username: String
            }]
    },
    { timestamps: true }
);

let Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;