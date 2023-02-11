class RadiographicsHandler {
  constructor(service, pictureService, validator, pictureValidator) {
    this._service = service;
    this._pictureService = pictureService;
    this._validator = validator;
    this._pictureValidator = pictureValidator;

    this.postRadiographicHandler = this.postRadiographicHandler.bind(this);
    this.getAllRadiographicsHandler = this.getAllRadiographicsHandler.bind(this);
    this.getRadiographicHandler = this.getRadiographicHandler.bind(this);
    this.putRadiographicPictureHandler = this.putRadiographicPictureHandler.bind(this);
    this.putRadiographicInterpretationHandler = this
      .putRadiographicInterpretationHandler.bind(this);
    this.deleteRadiographicByIdHandler = this.deleteRadiographicByIdHandler.bind(this);
  }

  async postRadiographicHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { patientId } = params;
      const { panoramikPicture, doctorId } = payload;

      this._pictureValidator.validatePictureHeaders(panoramikPicture.hapi.headers);

      const filename = await this
        ._pictureService.writeFile(panoramikPicture, panoramikPicture.hapi);
      const pictureUrl = `/upload/pictures/${filename}`;

      const radiographicId = await this._service
        .addRadiographic(pictureUrl, patientId, doctorId, credentialId);

      const response = h.response({
        status: 'success',
        message: 'Radiografi berhasil ditambahkan',
        data: radiographicId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllRadiographicsHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);

      const { month } = query;
      const radiographics = await this._service.getAllRadiographics(month);

      return {
        status: 'success',
        data: radiographics,
        count: radiographics.length,
      };
    } catch (error) {
      return error;
    }
  }

  async getRadiographicHandler({ auth, params }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const { radiographicId } = params;
      const radiographic = await this._service.getRadiographicById(radiographicId);

      return {
        status: 'success',
        data: radiographic,
      };
    } catch (error) {
      return error;
    }
  }

  async putRadiographicPictureHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { radiographicId } = params;
      const { panoramikPicture } = payload;

      this._pictureValidator.validatePictureHeaders(panoramikPicture.hapi.headers);

      const filename = await this
        ._pictureService.writeFile(panoramikPicture, panoramikPicture.hapi);
      const pictureUrl = `/upload/pictures/${filename}`;

      const radiographic = await this._service.editRadiographicPicture(radiographicId, pictureUrl);

      const response = h.response({
        status: 'success',
        message: 'Gambar radiografi berhasil diperbarui',
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async putRadiographicInterpretationHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessDoctor(credentialId);

      const { radiographicId } = params;

      const radiographic = await this
        ._service.editRadiographicInterpretation(radiographicId, payload);

      const response = h.response({
        status: 'success',
        message: 'Interpretasi manual radiografi berhasil diperbarui',
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteRadiographicByIdHandler({ params, auth }, h) {
    try {
      const { radiographicId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccessRadiographer(credentialId);
      const radiographic = await this._service.deleteRadiographicById(radiographicId);

      const response = h.response({
        status: 'success',
        message: 'Radiografi berhasil dihapus',
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = RadiographicsHandler;
