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

    let historyId = `history-${nanoid(16)}`;
    const status = 0;

    let radioQueryText = `INSERT INTO histories (id, panoramik_picture, upload_date, status, radiographer_id, patient_id)
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id, panoramik_picture, upload_date, status`;

    let radioQueryParams = [
      historyId,
      panoramikPicture,
      uploadDate,
      status,
      radiographerId,
      patientId,
    ];

    const radiographicQuery = {
      text: radioQueryText,
      values: radioQueryParams,
    };

    const radiographicResult = await this._pool.query(radiographicQuery);

    if (!radiographicResult.rowCount) {
      throw new InvariantError("Radiografi gagal ditambahkan");
    }

    // const historyId = `history-${nanoid(16)}`;

    // const historyQuery = {
    //   text: `INSERT INTO histories (id, patient_id, radiographer_id, radiographic_id, panoramik_picture, upload_date)
    //     VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
    //   values: [
    //     historyId,
    //     patientId,
    //     radiographerId,
    //     radiographicId,
    //     panoramikPicture,
    //     uploadDate,
    //   ],
    // };

    // const historyResult = await this._pool.query(historyQuery);

    // if (!historyResult.rowCount) {
    //   throw new InvariantError("Riwayat gagal ditambahkan");
    // }

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
    let queryText = `SELECT COUNT(*) AS total_rows
    FROM histories h
    INNER JOIN (
      SELECT patient_id, MAX(created_at) AS created_at
      FROM histories
      GROUP BY patient_id
    )latest ON h.patient_id = latest.patient_id AND h.created_at = latest.created_at
    `;

    if (month !== undefined) {
      queryText += ` WHERE EXTRACT(MONTH FROM date(h.upload_date)) = ${month}`;
    }

    // queryText += ` group by h.patient_id`;

    const query = {
      text: queryText,
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Radiografi tidak ditemukan");
    }

    return result.rows[0].total_rows;
  }

  async getAllRadiographics(month, limit, offset, search, verified) {
    let queryText = `SELECT h.id AS history_id, p.medic_number as medic_number, p.fullname, u2.fullname AS doctor_name, u.fullname AS radiographer_name, json_agg(d.*) AS diagnoses, u2.id AS doctor_id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status, h.system_check_date
    FROM histories h
    INNER JOIN (
      SELECT patient_id, MAX(created_at) AS created_at
      FROM histories
      GROUP BY patient_id
    )latest ON h.patient_id = latest.patient_id AND h.created_at = latest.created_at
    LEFT JOIN patients p ON h.patient_id = p.id
    LEFT JOIN users u ON h.radiographer_id = u.id
    LEFT JOIN users u2 ON h.doctor_id = u2.id
    LEFT JOIN diagnoses d ON h.id = d.history_id
    `;

    const queryParams = [];
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      queryText +=
        "WHERE LOWER(p.fullname) LIKE $1 OR LOWER(p.medic_number) LIKE $1";
      queryParams.push(searchParam);
    }

    if (verified !== undefined && verified !== "") {
      if (queryParams.length > 0) {
        queryText += " AND ";
      } else {
        queryText += " WHERE ";
      }

      if (verified == "true") {
        verified = 1;
      } else if (verified == "false") {
        verified = 0;
      }
      queryText += `h.status = $${queryParams.length + 1}`;
      queryParams.push(verified);
    }

    if (month !== undefined) {
      if (queryParams.length > 0) {
        queryText += " AND ";
      } else {
        queryText += " WHERE ";
      }
      queryText += `EXTRACT(MONTH FROM date(h.upload_date)) = $${
        queryParams.length + 1
      }`;
      queryParams.push(month);
    }

    queryText += ` group by h.patient_id, h.id, p.medic_number, p.fullname, u2.fullname, u.fullname, u2.id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status, h.system_check_date`;
    queryText += ` order by h.created_at desc`;

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
    let queryText = `SELECT h.id AS history_id, p.medic_number as medic_number, p.fullname, u2.fullname AS doctor_name, u.fullname AS radiographer_name, json_agg(d.*) AS diagnoses, u2.id AS doctor_id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status, h.system_check_date
    FROM histories h
    LEFT JOIN patients p ON h.patient_id = p.id
    LEFT JOIN users u ON h.radiographer_id = u.id
    LEFT JOIN users u2 ON h.doctor_id = u2.id
    LEFT JOIN diagnoses d ON h.id = d.history_id
    WHERE system_check_date IS NOT NULL
    `;

    const queryParams = [];
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      queryText +=
        " AND LOWER(p.fullname) LIKE $1 OR LOWER(p.medic_number) LIKE $1";
      queryParams.push(searchParam);
    }

    // if (month !== undefined) {
    //   if (queryParams.length > 0) {
    //     queryText += " AND ";
    //   } else {
    //     queryText += " WHERE ";
    //   }
    //   queryText += `EXTRACT(MONTH FROM date(radiographics.panoramik_upload_date)) = $${
    //     queryParams.length + 1
    //   }`;
    //   queryParams.push(month);
    // }

    queryText += ` group by h.patient_id, h.id, p.medic_number, p.fullname, u2.fullname, u.fullname, u2.id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status`;
    queryText += ` order by h.created_at desc`;

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
      text: `SELECT h.id AS history_id, p.medic_number, p.fullname, u2.fullname AS doctor_name, u.fullname AS radiographer_name, json_agg(d.*) AS diagnoses, u2.id AS doctor_id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status, h.system_check_date
      FROM histories h
      LEFT JOIN patients p ON h.patient_id = p.id
      LEFT JOIN users u ON h.radiographer_id = u.id
      LEFT JOIN users u2 ON h.doctor_id = u2.id
      LEFT JOIN diagnoses d ON h.id = d.history_id
      WHERE h.id = $1
      group by h.id, p.medic_number, p.fullname, u2.fullname, u.fullname, u2.id, h.panoramik_picture, h.upload_date, h.panoramik_check_date, h.status, h.system_check_date
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
      LEFT JOIN users doctor ON histories.doctor_id = doctor.id
      LEFT JOIN diagnoses ON histories.id = diagnoses.history_id
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

  async editRadiographicDoctor(radiographicId, { doctorId, historyId }) {
    const query = {
      text: "UPDATE histories SET doctor_id = $1 WHERE id = $2 RETURNING id",
      values: [doctorId, historyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Radiografi gagal diperbarui");
    }

    return result.rows[0];
  }

  async editRadiographicPicture(radiographicId, pictureUrl) {
    const uploadDate = new Date().toLocaleDateString("en-ZA", {
      timeZone: "Asia/Jakarta",
    });
    const timestamp = new Date();

    const historyQuery = {
      text: "UPDATE histories SET panoramik_picture = $1, upload_date = $2, created_at = $3, updated_at = $3 WHERE id = $4 RETURNING id",
      values: [pictureUrl, uploadDate, timestamp, radiographicId],
    };

    const historyResult = await this._pool.query(historyQuery);

    const query = {
      text: "UPDATE radiographics SET panoramik_picture = $1, panoramik_upload_date = $2 WHERE id = $3 RETURNING id, panoramik_picture",
      values: [pictureUrl, uploadDate, radiographicId],
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
      text: "DELETE FROM histories WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Pasien gagal dihapus. Id tidak ditemukan");
    }
  }

  async updateRadiographicStatus({ historyId }) {
    const now = new Date().toLocaleDateString("en-ZA", {
      timeZone: "Asia/Jakarta",
    });
    const query = {
      text: "UPDATE histories SET status = 1, panoramik_check_date = $1 WHERE id = $2 RETURNING id, status, panoramik_check_date",
      values: [now, historyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Status radiografi gagal diperbarui");
    }

    return result.rows[0];
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
