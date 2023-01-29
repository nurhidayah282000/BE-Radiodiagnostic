class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler({ payload }, h) {
    try {
      this._validator.validatePostAuthenticationPayload(payload);

      const { email, password } = payload;
      const id = await this._usersService.verifyUserCredential(email, password);
      const role = await this._usersService.getUserRoleByEmail(email);
      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
          role,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async putAuthenticationHandler({ payload }) {
    try {
      this._validator.validatePutAuthenticationPayload(payload);

      const { refreshToken } = payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      return {
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: accessToken,
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAuthenticationHandler({ payload }) {
    try {
      this._validator.validateDeleteAuthenticationPayload(payload);

      const { refreshToken } = payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = AuthenticationsHandler;
