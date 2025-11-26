const Post = require("../models/posts");
const User = require("../models/users");
let cloudinary = require('cloudinary').v2;


let getProfile = async (req, res) => {
    let { username } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(201).json({ message: "User not Found", success: false })
        }
        return res.status(200).json({ message: 'User Found', user: user, success: true })
    } catch (error) {
        return res.status(201).json({ message: error, success: false })
    }

}

let getProfilePosts = async (req, res) => {
    let { username } = req.body;
    try {
        let posts = await Post.find({ username: username });
        if (!posts) {
            return res.status(201).json({ message: "No Posts", success: false })
        }
        return res.status(200).json({ message: 'Posts Found', posts: posts, success: true })
    } catch (error) {
        return res.status(201).json({ message: `Error: ${error}`, success: false })
    }

}

let updateProfile = async (req, res) => {
    let { username, name, bio, gender, userId } = req.body;

    try {
        let picture = null;

        // Agar file upload ki gai hai to hi Cloudinary par upload karo
        if (req.files && req.files.profilePicture) {
            const media = req.files.profilePicture;

            const uploaded = await cloudinary.uploader.upload(media.tempFilePath, {
                folder: 'profile-pictures',
                resource_type: "image",
                loading: "eager"
            });

            picture = uploaded.secure_url;
        }

        // Update object
        let updateData = {
            name,
            bio,
            gender,
        };

        // Agar nayi picture ayi hai tou set karo
        if (picture) {
            updateData.profilePicture = picture;
        }

        // Agar username change karna ho tou update me include karo
        if (username) {
            updateData.username = username;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },          // filter
            { $set: updateData },  // update
            { new: true }          // return updated document
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        return res.status(201).json({
            success: false,
            message: "Server Error"
        });
    }
};


module.exports = {
    getProfile,
    getProfilePosts,
    updateProfile
}