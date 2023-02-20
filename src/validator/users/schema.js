const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  fullname: Joi.string().max(50).required(),
  email: Joi.string().max(50).required(),
  phoneNumber: Joi.string().max(30),
  gender: Joi.string(),
  profession: Joi.string().max(50),
  address: Joi.string(),
  province: Joi.string().max(50),
  city: Joi.string().max(50),
  postalCode: Joi.string().max(10),
  role: Joi.string().max(20).required(),
  profilePircture: Joi.string(),
});

module.exports = { UserPayloadSchema };
