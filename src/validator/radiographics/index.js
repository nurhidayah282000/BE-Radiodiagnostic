const InvariantError = require('../../exceptions/InvariantError');
const { RadiographicPayloadSchema } = require('./schema');

const RadiographicsValidator = {
  validateRadiographicPayload: (payload) => {
    const validationResult = RadiographicPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RadiographicsValidator;
