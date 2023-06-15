/* eslint-disable camelcase */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class PatientsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPatient({
    fullname,
    medic_number,
    id_number,
    gender,
    religion,
    address,
    born_location,
    born_date,
    phone_number,
    referral_origin,
    radiographic_id,
  }) {
    const new_born_date = Date.parse(`${born_date} GMT`);
    const age_dif = Date.now() - new_born_date;
    const age_date = new Date(age_dif);
    const age = Math.abs(age_date.getUTCFullYear() - 1970).toString();
    const id = `patient-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO patients (id, fullname, medic_number, id_number,
        gender, religion, address, born_location,
        born_date, age, phone_number, referral_origin, radiographic_id)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, fullname, fullname, id_number`,
      values: [
        id,
        fullname,
        medic_number,
        id_number,
        gender,
        religion,
        address,
        born_location,
        born_date,
        age,
        phone_number,
        referral_origin,
        radiographic_id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Pasien gagal ditambahkan");
    }
    return result.rows[0];
  }

  async getPatientTotalRows() {
    const query = {
      text: `SELECT histories.upload_date, histories.panoramik_check_date
      FROM patients
      LEFT JOIN users ON patients.radiographic_id = users.id
      LEFT JOIN (
        SELECT patient_id, MAX(upload_date) AS upload_date, MAX(panoramik_check_date) AS panoramik_check_date, MAX(created_at) as created_at FROM histories group by patient_id
      ) histories ON patients.id = histories.patient_id
      `,
    };

    let total = 0;
    let verified = 0;
    let unverified = 0;
    let thisDay = 0;
    let thisMonth = 0;

    const result = await this._pool.query(query);

    result.rows.forEach((row) => {
      total += 1;
      if (row.panoramik_check_date) {
        verified += 1;
      }
      if (!row.panoramik_check_date) {
        unverified += 1;
      }
      if (row.upload_date) {
        const uploadDate = new Date(row.upload_date);
        const today = new Date();
        if (
          uploadDate.getDate() === today.getDate() &&
          uploadDate.getMonth() === today.getMonth() &&
          uploadDate.getFullYear() === today.getFullYear()
        ) {
          thisDay += 1;
        }
        if (
          uploadDate.getMonth() === today.getMonth() &&
          uploadDate.getFullYear() === today.getFullYear()
        ) {
          thisMonth += 1;
        }
      }
    });

    result.rows = {
      total,
      verified,
      unverified,
      thisDay,
      thisMonth,
    };

    if (!result.rowCount) {
      throw new NotFoundError("Pasien tidak ditemukan");
    }

    return result.rows;
  }

  async getAllPatient(limit, offset, search) {
    let queryText = `SELECT patients.*, users.fullname as radiographer
    FROM patients
    LEFT JOIN users ON patients.radiographic_id = users.id`;

    const query = {
      text: queryText,
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Pasien tidak ditemukan");
    }

    return result.rows;
  }

  async getAllPatients(limit, offset, search) {
    let queryText = `SELECT patients.*, users.fullname as radiographer, latest.upload_date, latest.panoramik_check_date
    FROM patients
    LEFT JOIN users ON patients.radiographic_id = users.id
    LEFT JOIN (
      SELECT patient_id, MAX(upload_date) AS upload_date, MAX(panoramik_check_date) AS panoramik_check_date, MAX(created_at) as created_at FROM histories group by patient_id
    ) latest ON patients.id = latest.patient_id
    `;

    const queryParams = [limit, offset];

    if (search) {
      let newQuery = "";
      if (search.toLowerCase() === "proses") {
        newQuery = " WHERE panoramik_check_date IS NULL";
      } else if (search.toLowerCase() === "selesai") {
        newQuery = " WHERE panoramik_check_date IS NOT NULL";
      } else {
        newQuery =
          " WHERE LOWER(patients.fullname) LIKE $3 OR LOWER(patients.medic_number) LIKE $3";
        queryParams.push(`%${search.toLowerCase()}%`);
      }
      queryText += newQuery;
    }

    queryText += " LIMIT $1 OFFSET $2";

    const query = {
      text: queryText,
      values: queryParams,
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Pasien tidak ditemukan");
    }

    return result.rows;
  }

  async getPatientById(patientId) {
    const query = {
      text: `SELECT patients.*, users.fullname as radiographer 
      FROM patients
      LEFT JOIN users ON patients.radiographic_id = users.id
      WHERE patients.id = $1`,
      values: [patientId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Pasien tidak ditemukan");
    }

    return result.rows[0];
  }

  async editPatient(
    patientId,
    {
      fullname,
      medic_number,
      id_number,
      gender,
      religion,
      address,
      born_location,
      born_date,
      phone_number,
      referral_origin,
      radiographic_id,
      updated_at,
    }
  ) {
    const query = {
      text: `UPDATE patients 
      SET fullname = $1, medic_number = $2, id_number = $3, gender = $4,
      religion =$5, address = $6, born_location = $7, born_date = $8, 
      phone_number = $9, referral_origin = $10, radiographic_id = $11, updated_at = $12
      WHERE id = $13 RETURNING id`,
      values: [
        fullname,
        medic_number,
        id_number,
        gender,
        religion,
        address,
        born_location,
        born_date,
        phone_number,
        referral_origin,
        radiographic_id,
        updated_at,
        patientId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Pasien gagal diperbarui");
    }
    return result.rows[0];
  }

  async deletePatientById(id) {
    const query = {
      text: "DELETE FROM patients WHERE id = $1 RETURNING id",
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

  async verifyNewid_number(id_number) {
    const query = {
      text: "SELECT id_number FROM patients WHERE id_number = $1",
      values: [id_number],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        "Gagal menambahkan/memperbarui pasien. Pasien sudah terdaftar."
      );
    }
  }
}

module.exports = PatientsService;
