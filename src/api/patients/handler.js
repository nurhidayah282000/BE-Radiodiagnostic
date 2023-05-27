class PatientsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPatientHandler = this.postPatientHandler.bind(this);
    this.getAllPatientsHandler = this.getAllPatientsHandler.bind(this);
    this.getAllPatientHandler = this.getAllPatientHandler.bind(this);
    this.getPatientHandler = this.getPatientHandler.bind(this);
    this.putPatientHandler = this.putPatientHandler.bind(this);
    this.deletePatientByIdHandler = this.deletePatientByIdHandler.bind(this);
  }

  async postPatientHandler({ payload, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      const { idNumber } = payload;

      await this._service.verifyUserAccessRadiographer(credentialId);
      await this._service.verifyNewid_number(idNumber);

      const patientId = await this._service.addPatient(payload);

      const response = h.response({
        status: "success",
        message: "Pasien berhasil ditambahkan",
        data: patientId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllPatientHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const patients = await this._service.getAllPatient();

      return {
        status: "success",
        data: patients,
      };
    } catch (error) {
      return error;
    }
  }

  async getAllPatientsHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const page = query.page || 1;
      const { search } = query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const patients = await this._service.getAllPatients(
        limit,
        offset,
        search
      );
      const {total, verified, unverified, thisDay, thisMonth} = await this._service.getPatientTotalRows();

      return {
        status: "success",
        data: patients,
        meta: {
          total,
          verified,
          unverified,
          thisDay,
          thisMonth,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
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
        status: "success",
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
        status: "success",
        message: "Pasien berhasil diperbarui",
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
        status: "success",
        message: "Pasien berhasil dihapus",
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
