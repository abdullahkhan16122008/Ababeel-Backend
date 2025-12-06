let mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
    {
        commentId: {type: String, required: true},
        replyTo: {type: String, required: true},
        username: {type: String, required: true},
        profilePicture: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1ETHj25I6ZphEu_NiXJIT42IDcuCHNVy5CnAc7mKQxA&s' },
        text: { type: String, required: true },
        likes: [{
            username: { type: String, required: true }
        }],
        createdAt: { type: Date, default: Date.now }
    }
);

let Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;