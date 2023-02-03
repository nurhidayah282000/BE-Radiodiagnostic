class UsersHandler {
  constructor(service, pictureService, validator, pictureValidator) {
    this._service = service;
    this._pictureService = pictureService;
    this._validator = validator;
    this._pictureValidator = pictureValidator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getAllUsersHandler = this.getAllUsersHandler.bind(this);
    this.getUserHandler = this.getUserHandler.bind(this);
    this.putUserHandler = this.putUserHandler.bind(this);
    this.putUserPictureHandler = this.putUserPictureHandler.bind(this);
    this.putUserPasswordHandler = this.putUserPasswordHandler.bind(this);
    this.deleteUserByIdHandler = this.deleteUserByIdHandler.bind(this);
  }

  async postUserHandler({ payload, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccess(credentialId);

      const {
        fullname, email, password, role,
      } = payload;

      const userId = await this._service.addUser({
        fullname, email, password, role,
      });

      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: userId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllUsersHandler({ auth }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const users = await this._service.getAllUsers();

      return {
        status: 'success',
        data: users,
      };
    } catch (error) {
      return error;
    }
  }

  async getUserHandler({ auth }) {
    try {
      const { id: credentialId } = auth.credentials;
      const user = await this._service.getUserById(credentialId);

      return {
        status: 'success',
        data: user,
      };
    } catch (error) {
      return error;
    }
  }

  async putUserHandler({ payload, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;

      const user = await this._service.editUser(credentialId, payload);

      const response = h.response({
        status: 'success',
        message: 'User berhasil diperbarui',
        data: user,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async putUserPictureHandler({ payload, auth }, h) {
    try {
      const { profilePicture } = payload;
      const { id: credentialId } = auth.credentials;

      this._pictureValidator.validatePictureHeaders(profilePicture.hapi.headers);

      const filename = await this._pictureService.writeFile(profilePicture, profilePicture.hapi);
      const pictureUrl = `/upload/pictures/${filename}`;

      const user = await this._service.editUserPicture(credentialId, pictureUrl);

      const response = h.response({
        status: 'success',
        message: 'User picture berhasil diperbarui',
        data: user,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async putUserPasswordHandler({ payload, auth }, h) {
    try {
      const { password } = payload;
      const { id: credentialId } = auth.credentials;

      const user = await this._service.editUserPassword(credentialId, password);

      const response = h.response({
        status: 'success',
        message: 'User password berhasil diperbarui',
        data: user,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteUserByIdHandler({ params, auth }, h) {
    try {
      const { userId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccess(credentialId);
      const user = await this._service.deleteUserById(userId);

      const response = h.response({
        status: 'success',
        message: 'User berhasil dihapus',
        data: user,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = UsersHandler;
