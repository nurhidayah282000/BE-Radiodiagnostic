const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const AuthenticationError = require("../../exceptions/AuthenticationError");
const InvariantError = require("../../exceptions/InvariantError");

class DiagnosesService {
  constructor() {
    this._pool = new Pool();
  }

  async upsertSystemDiagnose({ toothNumber, systemDiagnosis, radiographicId }) {
    let query = {
      text: `SELECT * FROM diagnoses WHERE tooth_number = $1 AND radiographic_id = $2`,
      values: [toothNumber, radiographicId],
    };

    const result = await this._pool.query(query);
    let diagnoseResult;

    if (result.rowCount) {
      const diagnoseQuery = {
        text: `UPDATE diagnoses SET system_diagnosis = $1 WHERE tooth_number = $2 AND radiographic_id = $3 RETURNING id, tooth_number, system_diagnosis`,
        values: [systemDiagnosis, toothNumber, radiographicId],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal diupdate");
      }
    } else {
      const diagnoseId = `diagnose-${nanoid(16)}`;

      const diagnoseQuery = {
        text: `INSERT INTO diagnoses (id, tooth_number, system_diagnosis, radiographic_id)
                    VALUES($1, $2, $3, $4) RETURNING id, tooth_number, system_diagnosis, radiographic_id`,
        values: [
          diagnoseId,
          toothNumber,
          systemDiagnosis,
          isCorrect,
          radiographicId,
        ],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal ditambahkan");
      }
    }

    return diagnoseResult.rows[0];
  }

  async upsertManualDiagnose({ toothNumber, manualDiagnosis, radiographicId }) {
    let query = {
      text: `SELECT * FROM diagnoses WHERE tooth_number = $1 AND radiographic_id = $2`,
      values: [toothNumber, radiographicId],
    };

    const result = await this._pool.query(query);
    let diagnoseResult;

    if (result.rowCount) {
      const diagnoseQuery = {
        text: `UPDATE diagnoses SET manual_diagnosis = $1 WHERE tooth_number = $2 AND radiographic_id = $3 RETURNING id, tooth_number, manual_diagnosis`,
        values: [manualDiagnosis, toothNumber, radiographicId],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal diupdate");
      }
    } else {
      const diagnoseId = `diagnose-${nanoid(16)}`;

      const diagnoseQuery = {
        text: `INSERT INTO diagnoses (id, tooth_number, manual_diagnosis, radiographic_id)
                    VALUES($1, $2, $3, $4) RETURNING id, tooth_number, system_diagnosis, radiographic_id`,
        values: [diagnoseId, toothNumber, manualDiagnosis, radiographicId],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal ditambahkan");
      }
    }

    return diagnoseResult.rows[0];
  }

  async verifyAccessDoctor(credentialId) {
    const query = {
      text: `SELECT * FROM users WHERE id = $1`,
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial anda invalid");
    }

    const { role } = result.rows[0];

    if (role !== "doctor") {
      throw new AuthenticationError("Anda tidak memiliki akses");
    }
  }
}

module.exports = DiagnosesService;
