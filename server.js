let express = require('express');
let app = express();
let port = 4000;
let cookieParser = require('cookie-parser');
let mongoose = require('mongoose');
let cors = require('cors');
const userRouter = require('./routes/index.route');
let fileUpload = require('express-fileupload');
require('dotenv').config();
let cloudinary = require('cloudinary').v2;

let cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});


// Middleware: useTempFiles creates a temp file and gives you the path
app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});