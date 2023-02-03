const InvariantError = require('../../exceptions/InvariantError');
const { PatientPayloadSchema } = require('./schema');

const PatientsValidator = {
  validatePatientPayload: (payload) => {
    const validationResult = PatientPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PatientsValidator;
