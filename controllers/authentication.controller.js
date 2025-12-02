let User = require('../models/users.js');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');




let registerController = async (req, res) => {
    // Registration logic here
    let { name, username, email, password, gender, bio } = req.body;


    let emailExists = await User.findOne({ email });
    let usernameExists = await User.findOne({ username });
    if (emailExists) {
        return res.status(201).json({message: 'User with given email already exists'});
    }
    if (usernameExists) {
        return res.status(201).json({message: 'User with given username already exists'});
    }

    let hashedPassword = await bcrypt.hash(password, 10);


    let newUser = new User({
        name,
        username,
        email,
        password: hashedPassword,
        gender,
        bio
    });

    try {
        await newUser.save();
        res.status(201).json({message: 'User registered successfully', success: true});
    } catch (err) {
        res.status(500).json({message: 'Error registering user'});
    }
};


let loginController = async (req, res) => {
    // Login logic here
    let { email, password } = req.body;

    let user = await User.findOne({$or: [{ email }, { username: email }]});
    
    let isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user) {
        return res.status(201).json({message: 'Invalid email or user does not exist'});
    }

    if (user.password !== password) {
        return res.status(201).json({message: 'Invalid password'});
    }

    let token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 1000 * 60 * parseInt(process.env.TOKEN_COOKIE_EXPIRES_IN) }); // 1 hour
    res.status(200).json({ token, message: 'Login successful', user, success: true });
}


module.exports = {
    registerController,
    loginController
};