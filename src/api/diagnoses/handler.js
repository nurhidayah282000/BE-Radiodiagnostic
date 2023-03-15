class DiagnosesHandler {
  constructor(service) {
    this._service = service;
    this.postSystemDiagonsesHandler =
      this.postSystemDiagonsesHandler.bind(this);
    this.postManualDiagonsesHandler =
      this.postManualDiagonsesHandler.bind(this);
  }

  async postSystemDiagonsesHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyAccessDoctor(credentialId);

      const { radiographicId } = params;
      const { toothNumber, systemDiagnosis } = payload;

      const diagnoses = await this._service.upsertSystemDiagnose({
        toothNumber,
        systemDiagnosis,
        radiographicId,
      });

      const response = h.response({
        status: "success",
        message: "Diagnosa berhasil ditambahkan",
        data: diagnoses,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async postManualDiagonsesHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyAccessDoctor(credentialId);

      const { radiographicId } = params;
      const { toothNumber, manualDiagnosis } = payload;

      const diagnoses = await this._service.upsertManualDiagnose({
        toothNumber,
        manualDiagnosis,
        radiographicId,
      });

      const response = h.response({
        status: "success",
        message: "Diagnosa berhasil ditambahkan",
        data: diagnoses,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = DiagnosesHandler;
