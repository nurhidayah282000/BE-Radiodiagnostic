const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class RadiographicsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRadiographic(panoramikPicture, patientId, radiographerId) {
    const uploadDate = new Date().toLocaleDateString("en-ZA", {
      timeZone: "Asia/Jakarta",
    });

    const radiographicId = `radiographic-${nanoid(16)}`;
    const status = 0;

    const radiographicQuery = {
      text: `INSERT INTO radiographics (id, panoramik_picture, panoramik_upload_date, status)
        VALUES($1, $2, $3, $4) RETURNING id, panoramik_picture, panoramik_upload_date, status`,
      values: [radiographicId, panoramikPicture, uploadDate, status],
    };

    const radiographicResult = await this._pool.query(radiographicQuery);

    if (!radiographicResult.rowCount) {
      throw new InvariantError("Radiografi gagal ditambahkan");
    }

    const historyId = `history-${nanoid(16)}`;

    const historyQuery = {
      text: `INSERT INTO histories (id, patient_id, radiographer_id, radiographic_id)
        VALUES($1, $2, $3, $4) RETURNING id`,
      values: [historyId, patientId, radiographerId, radiographicId],
    };

    const historyResult = await this._pool.query(historyQuery);

    if (!historyResult.rowCount) {
      throw new InvariantError("Riwayat gagal ditambahkan");
    }

    return radiographicResult.rows[0];
  }

  async getAllRadiographicsUser() {
    const query = {
      text: "SELECT * FROM users WHERE role = 'radiographer'",
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows;
  }

  async getAllDoctorsUser() {
    const query = {
      text: "SELECT * FROM users WHERE role = 'doctor'",
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows;
  }

  async getAllRadiographics(month) {
    let queryText = `SELECT histories.patient_id,patients.medic_number, patients.fullname, radiographics.panoramik_picture,
    radiographics.panoramik_upload_date, radiographics.id AS radiographics_id, radiographics.panoramik_check_date, radiographics.manual_interpretation, radiographics.status, doctor.fullname AS doctor_name,
    radiographer.fullname AS radiographer_name
    FROM histories
    LEFT JOIN patients ON histories.patient_id = patients.id
    LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
    LEFT JOIN users doctor ON histories.doctor_id = doctor.id
    INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id`;

    if (month !== undefined) {
      queryText += ` WHERE EXTRACT(MONTH FROM date(radiographics.panoramik_upload_date)) = ${month}`;
    }

    const query = {
      text: queryText,
    };

    const result = await this._pool.query(query);
    // add system radiodiagnosis after query..

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows;
  }

  async getRadiographicById(radiographicId) {
    const query = {
      text: `SELECT histories.patient_id, patients.medic_number, patients.fullname, radiographics.id AS radiographics_id, radiographics.panoramik_picture,
      radiographics.panoramik_upload_date, radiographics.panoramik_check_date, radiographics.manual_interpretation, radiographics.status,doctor_id AS doctor_id, doctor.fullname AS doctor_name,
      radiographer.fullname AS radiographer_name
      FROM histories
      LEFT JOIN patients ON histories.patient_id = patients.id
      LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
      LEFT JOIN users doctor ON histories.doctor_id = doctor.id
      INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
      WHERE histories.radiographic_id = $1
      `,
      values: [radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows[0];
  }

  async editRadiographicDoctor(radiographicId, { doctorId }) {
    const query = {
      text: "UPDATE histories SET doctor_id = $1 WHERE radiographic_id = $2 RETURNING id",
      values: [doctorId, radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Radiografi gagal diperbarui");
    }
    return result.rows[0];
  }

  async editRadiographicPicture(radiographicId, pictureUrl) {
    const query = {
      text: "UPDATE radiographics SET panoramik_picture = $1 WHERE id = $2 RETURNING id, panoramik_picture",
      values: [pictureUrl, radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gambar radiografi gagal diperbarui");
    }
    return result.rows[0];
  }

  async editRadiographicInterpretation(
    radiographicId,
    { manualInterpretation }
  ) {
    const uploadDate = new Date().toLocaleDateString("en-ZA", {
      timeZone: "Asia/Jakarta",
    });

    const query = {
      text: "UPDATE radiographics SET manual_interpretation = $1, panoramik_check_date = $2 WHERE id = $3 RETURNING id, manual_interpretation",
      values: [manualInterpretation, uploadDate, radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        "Interpretasi manual radiografi gagal diperbarui"
      );
    }
    return result.rows[0];
  }

  async deleteRadiographicInterpretation(radiographicId) {
    const query = {
      text: "UPDATE radiographics SET manual_interpretation = null, panoramik_check_date = null WHERE id = $1 RETURNING id",
      values: [radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        "Interpretasi manual radiografi gagal diperbarui"
      );
    }
    return result.rows[0];
  }

  async deleteRadiographicById(id) {
    const query = {
      text: "DELETE FROM radiographics WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Pasien gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyUserAccess(credentialId) {
    const query = {
      text: "SELECT role FROM users WHERE id = $1",
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial anda invalid");
    }

    const { role } = result.rows[0];

    if (!(role === "radiographer" || role === "doctor")) {
      throw new AuthenticationError("Anda tidak memilki akeses");
    }
  }

  async verifyUserAccessRadiographer(credentialId) {
    const query = {
      text: "SELECT role FROM users WHERE id = $1",
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial anda invalid");
    }

    const { role } = result.rows[0];

    if (role !== "radiographer") {
      throw new AuthenticationError("Anda tidak memilki akeses");
    }
  }

  async verifyUserAccessDoctor(credentialId) {
    const query = {
      text: "SELECT role FROM users WHERE id = $1",
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial anda invalid");
    }

    const { role } = result.rows[0];

    if (role !== "doctor") {
      throw new AuthenticationError("Anda tidak memilki akeses");
    }
  }
}

module.exports = RadiographicsService;
