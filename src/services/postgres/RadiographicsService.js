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

    let radiographicId = `radiographic-${nanoid(16)}`;
    const status = 0;

    const radiographic = await this._pool.query(
      `SELECT * FROM histories WHERE patient_id = '${patientId}'`
    );

    let radioQueryText = `INSERT INTO radiographics (id, panoramik_picture, panoramik_upload_date, status)
    VALUES($1, $2, $3, $4) RETURNING id, panoramik_picture, panoramik_upload_date, status`;

    let radioQueryParams = [
      radiographicId,
      panoramikPicture,
      uploadDate,
      status,
    ];

    if (radiographic.rowCount) {
      radiographicId = radiographic.rows[0].radiographic_id;
      radioQueryText = `UPDATE radiographics SET panoramik_picture = $1, panoramik_upload_date = $2, status = $3 WHERE id = $4 RETURNING id, panoramik_picture, panoramik_upload_date, status`;
      radioQueryParams = [
        panoramikPicture,
        uploadDate,
        status,
        radiographic.rows[0].radiographic_id,
      ];
    }

    const radiographicQuery = {
      text: radioQueryText,
      values: radioQueryParams,
    };

    const radiographicResult = await this._pool.query(radiographicQuery);

    if (!radiographicResult.rowCount) {
      throw new InvariantError("Radiografi gagal ditambahkan");
    }

    const historyId = `history-${nanoid(16)}`;

    const historyQuery = {
      text: `INSERT INTO histories (id, patient_id, radiographer_id, radiographic_id, panoramik_picture)
        VALUES($1, $2, $3, $4, $5) RETURNING id`,
      values: [historyId, patientId, radiographerId, radiographicId, panoramikPicture],
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

  async getRadiographicsTotalRows(month) {
    let queryText = `SELECT COUNT(*) as total_rows
    FROM histories
    LEFT JOIN patients ON histories.patient_id = patients.id
    LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
    LEFT JOIN users doctor ON histories.doctor_id = doctor.id
    INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
    `;

    if (month !== undefined) {
      queryText += ` WHERE EXTRACT(MONTH FROM date(radiographics.panoramik_upload_date)) = ${month}`;
    }

    const query = {
      text: queryText,
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows[0].total_rows;
  }

  async getAllRadiographics(month, limit, offset, search) {
    let queryText = `SELECT MAX(histories.patient_id) AS patient_id, MAX(patients.medic_number) AS medic_number, MAX(patients.fullname) AS fullname, MAX(radiographics.panoramik_picture) AS panoramik_picture,
    MAX(radiographics.panoramik_upload_date) AS panoramik_upload_date, MAX(radiographics.id) AS radiographics_id, MAX(radiographics.panoramik_check_date) AS panoramik_check_date, MAX(radiographics.manual_interpretation) AS manual_interpretation, MAX(radiographics.status) AS status, MAX(doctor.fullname) AS doctor_name,
    MAX(radiographer.fullname) AS radiographer_name
    FROM radiographics
    LEFT JOIN histories ON histories.radiographic_id = radiographics.id
    LEFT JOIN patients ON histories.patient_id = patients.id
    LEFT JOIN users doctor ON histories.doctor_id = doctor.id
    INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
    `;


    const queryParams = [];
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      queryText +=
        "WHERE LOWER(patients.fullname) LIKE $1 OR LOWER(patients.medic_number) LIKE $1";
      queryParams.push(searchParam);
    }

    if (month !== undefined) {
      if (queryParams.length > 0) {
        queryText += " AND ";
      } else {
        queryText += " WHERE ";
      }
      queryText += `EXTRACT(MONTH FROM date(radiographics.panoramik_upload_date)) = $${
        queryParams.length + 1
      }`;
      queryParams.push(month);
    }

    queryText += ` group by radiographics.id`

    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    const query = {
      text: queryText,
      values: queryParams,
    };

    const result = await this._pool.query(query);
    // add system radiodiagnosis after query..

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows;
  }

  async getAllHistories(month, limit, offset, search) {
    let queryText = `SELECT histories.id, histories.patient_id,patients.medic_number, patients.fullname, histories.panoramik_picture,
    radiographics.panoramik_upload_date, radiographics.id AS radiographics_id, radiographics.panoramik_check_date, radiographics.manual_interpretation, radiographics.status, doctor.fullname AS doctor_name,
    radiographer.fullname AS radiographer_name
    FROM histories
    LEFT JOIN patients ON histories.patient_id = patients.id
    LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
    LEFT JOIN users doctor ON histories.doctor_id = doctor.id
    INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
    order by radiographics.panoramik_upload_date desc
    `;

    const queryParams = [];
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      queryText +=
        "WHERE LOWER(patients.fullname) LIKE $1 OR LOWER(patients.medic_number) LIKE $1";
      queryParams.push(searchParam);
    }

    if (month !== undefined) {
      if (queryParams.length > 0) {
        queryText += " AND ";
      } else {
        queryText += " WHERE ";
      }
      queryText += `EXTRACT(MONTH FROM date(radiographics.panoramik_upload_date)) = $${
        queryParams.length + 1
      }`;
      queryParams.push(month);
    }

    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    const query = {
      text: queryText,
      values: queryParams,
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
      text: `SELECT histories.patient_id, patients.medic_number, patients.fullname, radiographics.id AS radiographics_id, 
      radiographics.panoramik_picture, radiographics.panoramik_upload_date, radiographics.panoramik_check_date, radiographics.manual_interpretation, 
      radiographics.status,doctor_id AS doctor_id, doctor.fullname AS doctor_name, radiographer.fullname AS radiographer_name, 
      json_agg(json_build_object('tooth_number', diagnoses.tooth_number, 'system_diagnosis', diagnoses.system_diagnosis, 'manual_diagnosis', diagnoses.manual_diagnosis, 'verificator_diagnosis', diagnoses.verificator_diagnosis)) AS diagnoses
      FROM histories
      LEFT JOIN patients ON histories.patient_id = patients.id
      LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
      LEFT JOIN users doctor ON histories.doctor_id = doctor.id
      LEFT JOIN diagnoses ON radiographics.id = diagnoses.radiographic_id
      INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
      WHERE histories.radiographic_id = $1
      GROUP BY histories.patient_id, patients.medic_number, patients.fullname, radiographics.id, radiographics.panoramik_picture,
      radiographics.panoramik_upload_date, radiographics.panoramik_check_date, radiographics.manual_interpretation, radiographics.status,doctor_id, doctor.fullname, radiographer.fullname
      `,
      values: [radiographicId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows[0];
  }

  async getHistoryById(historyId) {
    const query = {
      text: `SELECT histories.patient_id, patients.medic_number, patients.fullname, radiographics.id AS radiographics_id, 
      histories.panoramik_picture, radiographics.panoramik_upload_date, radiographics.panoramik_check_date, radiographics.manual_interpretation, 
      radiographics.status,doctor_id AS doctor_id, doctor.fullname AS doctor_name, radiographer.fullname AS radiographer_name, 
      json_agg(json_build_object('tooth_number', diagnoses.tooth_number, 'system_diagnosis', diagnoses.system_diagnosis, 'manual_diagnosis', diagnoses.manual_diagnosis, 'verificator_diagnosis', diagnoses.verificator_diagnosis)) AS diagnoses
      FROM histories
      LEFT JOIN patients ON histories.patient_id = patients.id
      LEFT JOIN radiographics ON histories.radiographic_id = radiographics.id
      LEFT JOIN users doctor ON histories.doctor_id = doctor.id
      LEFT JOIN diagnoses ON radiographics.id = diagnoses.radiographic_id
      INNER JOIN users radiographer ON histories.radiographer_id = radiographer.id
      WHERE histories.id = $1
      GROUP BY histories.patient_id, patients.medic_number, patients.fullname, radiographics.id, histories.panoramik_picture,
      radiographics.panoramik_upload_date, radiographics.panoramik_check_date, radiographics.manual_interpretation, radiographics.status,doctor_id, doctor.fullname, radiographer.fullname
      `,
      values: [historyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("History tidak ditemukan");
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
