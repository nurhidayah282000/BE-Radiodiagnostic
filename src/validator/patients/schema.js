const Joi = require('joi');

const PatientPayloadSchema = Joi.object({
  fullname: Joi.string().max(50).required(),
  idNumber: Joi.string().max(16).required(),
  gender: Joi.string().max(10).required(),
  religion: Joi.string().max(50).required(),
  address: Joi.string().required(),
  bornLocation: Joi.string().max(50).required(),
  bornDate: Joi.string().max(50).required(),
  phoneNumber: Joi.string().max(30),
  referralOrigin: Joi.string().max(50),
});

module.exports = { PatientPayloadSchema };
