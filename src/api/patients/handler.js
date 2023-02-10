class PatientsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPatientHandler = this.postPatientHandler.bind(this);
    this.getAllPatientsHandler = this.getAllPatientsHandler.bind(this);
    this.getPatientHandler = this.getPatientHandler.bind(this);
    this.putPatientHandler = this.putPatientHandler.bind(this);
    this.deletePatientByIdHandler = this.deletePatientByIdHandler.bind(this);
  }

  async postPatientHandler({ payload, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      const { idNumber } = payload;

      await this._service.verifyUserAccessRadiographer(credentialId);
      await this._service.verifyNewIdNumber(idNumber);

      const patientId = await this._service.addPatient(payload);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil ditambahkan',
        data: patientId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllPatientsHandler({ auth }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const patients = await this._service.getAllPatients();

      return {
        status: 'success',
        data: patients,
      };
    } catch (error) {
      return error;
    }
  }

  async getPatientHandler({ auth, params }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const { patientId } = params;
      const patient = await this._service.getPatientById(patientId);

      return {
        status: 'success',
        data: patient,
      };
    } catch (error) {
      return error;
    }
  }

  async putPatientHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { patientId } = params;
      const patient = await this._service.editPatient(patientId, payload);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil diperbarui',
        data: patient,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deletePatientByIdHandler({ params, auth }, h) {
    try {
      const { patientId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccessRadiographer(credentialId);
      const patient = await this._service.deletePatientById(patientId);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil dihapus',
        data: patient,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = PatientsHandler;
