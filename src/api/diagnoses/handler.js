class DiagnosesHandler {
  constructor(service, radiographicService) {
    this._service = service;
    this._radiographicService = radiographicService;
    this.postSystemDiagonsesHandler =
      this.postSystemDiagonsesHandler.bind(this);
    this.postManualDiagonsesHandler =
      this.postManualDiagonsesHandler.bind(this);
    this.getDummyDiagnosesHandler = this.getDummyDiagnosesHandler.bind(this);
    this.updateVerificatorDiagnoseHandler =
      this.updateVerificatorDiagnoseHandler.bind(this);
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

  async updateVerificatorDiagnoseHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyAccessDoctor(credentialId);

      const { diagnosaId } = params;
      const { verificatorDiagnosis, verificatorNote, isCorrect } = payload;

      const diagnoses = await this._service.updateVerificatorDiagnose({
        verificatorDiagnosis,
        verificatorNote,
        isCorrect,
        diagnosaId,
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
        historyId: radiographicId,
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

  async getDummyDiagnosesHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;

      await this._service.verifyAccessRadiographer(credentialId);

      const { radiographicId } = params;
      const { patientId, radiographerId } = payload;

      const diagnoses = await this._service.getDummySystemDiagnoses({
        historyId: radiographicId,
        patientId,
        radiographerId,
      });

      const response = h.response({
        status: "success",
        data: {
          diagnoses,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = DiagnosesHandler;
