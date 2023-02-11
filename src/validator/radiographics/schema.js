const Joi = require('joi');

const RadiographicPayloadSchema = Joi.object({
  panoramikPicture: Joi.string(),
  status: Joi.number(),
});

module.exports = { RadiographicPayloadSchema };
