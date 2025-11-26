let Joi = require('joi');


let postSchema = Joi.object({
    type: Joi.string().required(),
    visibility: Joi.string().required(),
});



let validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};


module.exports = {
    validatePost,
};