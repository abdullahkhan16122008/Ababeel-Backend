let Joi = require('joi');


let registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid('male', 'female', 'other'),
    bio: Joi.string().max(160)
});

let loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});


let validateRegistration = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(201).json({ error: error.details[0].message });
    }
    next();
};

let validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(201).json({ error: error.details[0].message });
    }
    next();
};


module.exports = {
    validateRegistration,
    validateLogin
};