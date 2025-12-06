let mongoose = require('mongoose');

// Define a sub-schema for the items in the array
const followerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
});


let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String },
    bio: { type: String },
    followers: [followerSchema],
    following: [followerSchema],
    profilePicture: {type: String},
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user'},
    refreshToken: { type: String }
}, { timestamps: true }
);
let User = mongoose.model('User', userSchema);
module.exports = User;