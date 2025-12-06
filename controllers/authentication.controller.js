let User = require('../models/users.js');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');




let registerController = async (req, res) => {
    // Registration logic here
    let { name, username, email, password, gender, bio } = req.body;


    let emailExists = await User.findOne({ email });
    let usernameExists = await User.findOne({ username });
    if (emailExists) {
        return res.status(201).json({ message: 'User with given email already exists' });
    }
    if (usernameExists) {
        return res.status(201).json({ message: 'User with given username already exists' });
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
        res.status(201).json({ message: 'User registered successfully', success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user' });
    }
};


let loginController = async (req, res) => {
    let { email, password } = req.body;

    // email ya username se login
    let user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) {
        return res.status(201).json({ message: 'Invalid credentials' });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(201).json({ message: 'Invalid credentials' });
    }

    // Access Token (short-lived)
    const accessToken = jwt.sign(
        { id: user._id, role: user.role, profilePicture: user.profilePicture, username: user.username, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // ya 1h jo bhi chahiye
    );

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET, // Alag secret rakhna better hai
        { expiresIn: '7d' }
    );

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Cookies set karo
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        message: 'Login successful',
        success: true,
        user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            gender: user.gender,
            bio: user.bio,
            role: user.role
        }
    });
};

let logoutController = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({ message: 'Logged out successfully', success: true });
};

let refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(201).json({ message: 'No refresh token', success: false });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(201).json({ message: 'Invalid refresh token', success: false });
        }

        // Naya access token banao
        const newAccessToken = jwt.sign(
            { id: user._id, role: user.role, profilePicture: user.profilePicture, username: user.username, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Optional: Naya refresh token bhi rotate kar sakte ho (recommended for security)
        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Token refreshed', success: true, user: { id: user._id, role: user.role, profilePicture: user.profilePicture, username: user.username, name: user.name } });

    } catch (err) {
        return res.status(201).json({ message: 'Invalid refresh token', success: false });
    }
};

let verifyController = async (req, res) => {
    // Token cookie ya Authorization header se le sakte ho
    let token = req.cookies.access_token;

    // Agar cookie nahi hai to header check karo (mobile apps ke liye useful)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(200).json({
            message: 'Access token missing',
            success: false,
            expired: true  // Frontend ko hint ki refresh karna hai
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return res.status(200).json({
                message: 'User not found',
                success: false
            });
        }

        // Sab kuch theek → current user return karo
        return res.status(200).json({
            user,
            success: true,
            message: 'Token valid'
        });

    } catch (err) {
        // Token expire ya invalid → frontend ko refresh karne bol do
        if (err.name === 'TokenExpiredError') {
            return res.status(201).json({
                message: 'Access token expired',
                success: false,
                expired: true   // Ye flag frontend use karega auto refresh ke liye
            });
        }

        return res.status(201).json({
            message: 'Invalid access token',
            success: false
        });
    }
};

module.exports = {
    registerController,
    loginController,
    verifyController,
    refreshTokenController,
    logoutController
};