/* eslint-disable no-param-reassign */
/* eslint-disable no-inner-declarations */
const excelJS = require("exceljs");

class RadiographicsHandler {
  constructor(service, pictureService, validator, pictureValidator) {
    this._service = service;
    this._pictureService = pictureService;
    this._validator = validator;
    this._pictureValidator = pictureValidator;

    this.postRadiographicHandler = this.postRadiographicHandler.bind(this);
    this.getAllRadiographicsUserHandler =
      this.getAllRadiographicsUserHandler.bind(this);
    this.getAllRadiographicsHandler =
      this.getAllRadiographicsHandler.bind(this);
    this.getAllHistoriesHandler = this.getAllHistoriesHandler.bind(this);
    this.getAllDoctorsUserHandler = this.getAllDoctorsUserHandler.bind(this);
    this.getAllRadiographicsRecapsHandler =
      this.getAllRadiographicsRecapsHandler.bind(this);
    this.getRadiographicHandler = this.getRadiographicHandler.bind(this);
    this.getHistoryHandler = this.getHistoryHandler.bind(this);
    this.putRadiographicPictureHandler =
      this.putRadiographicPictureHandler.bind(this);
    this.putRadiographicDoctorHandler =
      this.putRadiographicDoctorHandler.bind(this);
    this.putRadiographicInterpretationHandler =
      this.putRadiographicInterpretationHandler.bind(this);
    this.deleteRadiographicInterpretationHandler =
      this.deleteRadiographicInterpretationHandler.bind(this);
    this.deleteRadiographicByIdHandler =
      this.deleteRadiographicByIdHandler.bind(this);
    this.updateRadiographicStatusHandler =
      this.updateRadiographicStatusHandler.bind(this);
  }

  async postRadiographicHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { patientId } = params;
      const { panoramikPicture } = payload;
      const { radiographerId } = payload;

      this._pictureValidator.validatePictureHeaders(
        panoramikPicture.hapi.headers
      );

      const filename = await this._pictureService.writeFile(
        panoramikPicture,
        panoramikPicture.hapi
      );
      const pictureUrl = `/upload/pictures/${filename}`;

      const radiographicId = await this._service.addRadiographic(
        pictureUrl,
        patientId,
        radiographerId
      );

      const response = h.response({
        status: "success",
        message: "Radiografi berhasil ditambahkan",
        data: radiographicId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllRadiographicsUserHandler({ auth }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const users = await this._service.getAllRadiographicsUser();

      return {
        status: "success",
        data: users,
      };
    } catch (error) {
      return error;
    }
  }

  async getAllDoctorsUserHandler({ auth }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const users = await this._service.getAllDoctorsUser();

      return {
        status: "success",
        data: users,
      };
    } catch (error) {
      return error;
    }
  }

  async getAllRadiographicsHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const page = query.page || 1;
      const limit = 6;
      const offset = (page - 1) * limit;
      const { month, search, verified } = query;
      const radiographics = await this._service.getAllRadiographics(
        month,
        limit,
        offset,
        search,
        verified
      );
      const totalRows = await this._service.getRadiographicsTotalRows(month);

      return {
        status: "success",
        data: radiographics,
        count: radiographics.length,
        meta: {
          totalRows,
          totalPages: Math.ceil(totalRows / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getAllHistoriesHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const page = query.page || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const { month, search } = query;
      const radiographics = await this._service.getAllHistories(
        month,
        limit,
        offset,
        search
      );
      const totalRows = await this._service.getRadiographicsTotalRows(month);

      return {
        status: "success",
        data: radiographics,
        count: radiographics.length,
        meta: {
          totalRows,
          totalPages: Math.ceil(totalRows / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getAllRadiographicsRecapsHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { month } = query;
      const radiographics = await this._service.getAllRadiographics(month);

      function monthName(mon) {
        return [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][mon - 1];
      }

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet(monthName(month));

      worksheet.columns = [
        { header: "Kode Pasien", key: "patient_id", width: 30 },
        { header: "Nama Pasien", key: "fullname", width: 30 },
        { header: "Url Panoramik", key: "panoramik_picture", width: 30 },
        {
          header: "Tanggal Pengecekan Radiografer",
          key: "panoramik_upload_date",
          width: 30,
        },
        {
          header: "Tanggal Pengecekan Dokter",
          key: "panoramik_check_date",
          width: 30,
        },
        {
          header: "Interpretasi Manual",
          key: "manual_interpretation",
          width: 50,
        },
        { header: "Status", key: "status", width: 10 },
        { header: "Nama Dokter", key: "doctor_name", width: 30 },
        { header: "Nama Radiografer", key: "radiographer_name", width: 30 },
      ];

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < radiographics.length; i++) {
        radiographics[
          i
        ].panoramik_picture = `http://${process.env.HOST}:${process.env.PORT}${radiographics[i].panoramik_picture}`;
        worksheet.addRow(radiographics[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // worksheet.getCell('A1').alignment = { vertical: 'top', horizontal: 'left' };

      const nameMonth = monthName(month) || "All";
      const datenow = new Date().toISOString().substring(0, 10);
      const filename = `recaps-${nameMonth}-${datenow}.xlsx`;
      const excelUrl = `/upload/recaps/${filename}`;

      await workbook.xlsx.writeFile(
        `./src/api/uploads/file/recaps/${filename}`
      );

      return {
        status: "success",
        data: { excelUrl },
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
      const radiographic = await this._service.getRadiographicById(
        radiographicId
      );

      return {
        status: "success",
        data: radiographic,
      };
    } catch (error) {
      return error;
    }
  }

  async getHistoryHandler({ auth, params }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const { historyId } = params;
      const radiographic = await this._service.getHistoryById(historyId);

      return {
        status: "success",
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

      this._pictureValidator.validatePictureHeaders(
        panoramikPicture.hapi.headers
      );

      const filename = await this._pictureService.writeFile(
        panoramikPicture,
        panoramikPicture.hapi
      );
      const pictureUrl = `/upload/pictures/${filename}`;

      const radiographic = await this._service.editRadiographicPicture(
        radiographicId,
        pictureUrl
      );

      const response = h.response({
        status: "success",
        message: "Gambar radiografi berhasil diperbarui",
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async putRadiographicDoctorHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessDoctor(credentialId);

      const { radiographicId } = params;

      const radiographic = await this._service.editRadiographicDoctor(
        radiographicId,
        payload
      );

      const response = h.response({
        status: "success",
        message: "Radiografi berhasil diperbarui",
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

      const radiographic = await this._service.editRadiographicInterpretation(
        radiographicId,
        payload
      );

      const response = h.response({
        status: "success",
        message: "Interpretasi manual radiografi berhasil diperbarui",
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteRadiographicInterpretationHandler({ auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessDoctor(credentialId);

      const { radiographicId } = params;

      const radiographic = await this._service.deleteRadiographicInterpretation(
        radiographicId
      );

      const response = h.response({
        status: "success",
        message: "Interpretasi manual radiografi berhasil diperbarui",
        data: radiographic,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async updateRadiographicStatusHandler({ auth, params }, h) {
    try {
      const { radiographicId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccessDoctor(credentialId);

      const radiographic = await this._service.updateRadiographicStatus({
        historyId: radiographicId,
      });

      const response = h.response({
        status: "success",
        message: "Status radiografi berhasil diperbarui",
        data: radiographic,
      });

      response.code(201);
    } catch (error) {
      return error;
    }
  }

  async deleteRadiographicByIdHandler({ params, auth }, h) {
    try {
      const { radiographicId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccessRadiographer(credentialId);
      const radiographic = await this._service.deleteRadiographicById(
        radiographicId
      );

      const response = h.response({
        status: "success",
        message: "Radiografi berhasil dihapus",
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
