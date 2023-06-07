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

  async updateVerificatorDiagnose({
    verificatorDiagnosis,
    verificatorNote,
    isCorrect,
    diagnosaId,
  }) {
    const now = new Date();

    const diagnoseQuery = {
      text: `UPDATE diagnoses SET verificator_diagnosis = $1, verificator_note = $2, verification_date = $3, is_corerct = $4 WHERE id = $5 RETURNING id, tooth_number, manual_diagnosis`,
      values: [
        verificatorDiagnosis,
        verificatorNote,
        now,
        isCorrect,
        diagnosaId,
      ],
    };

    let diagnoseResult = await this._pool.query(diagnoseQuery);

    if (!diagnoseResult.rowCount) {
      throw new InvariantError("Diagnosa gagal diupdate");
    }

    return diagnoseResult.rows[0];
  }

  async upsertManualDiagnose({
    toothNumber,
    manualDiagnosis,
    diagnosaId,
    historyId,
  }) {
    let query = {
      text: `SELECT * FROM diagnoses WHERE tooth_number = $1 AND history_id = $2`,
      values: [toothNumber, historyId],
    };

    const result = await this._pool.query(query);
    let diagnoseResult;

    if (result.rowCount) {
      const diagnoseQuery = {
        text: `UPDATE diagnoses SET manual_diagnosis = $1, is_corerct = 1, WHERE tooth_number = $2 AND history_id = $3 RETURNING id, tooth_number, manual_diagnosis`,
        values: [manualDiagnosis, toothNumber, historyId],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal diupdate");
      }
    } else {
      const diagnoseId = `diagnose-${nanoid(16)}`;

      const diagnoseQuery = {
        text: `INSERT INTO diagnoses (id, is_corerct, tooth_number, manual_diagnosis, history_id)
                    VALUES($1, 1, $2, $3, $4) RETURNING id, tooth_number, system_diagnosis, history_id`,
        values: [diagnoseId, toothNumber, manualDiagnosis, historyId],
      };

      diagnoseResult = await this._pool.query(diagnoseQuery);

      if (!diagnoseResult.rowCount) {
        throw new InvariantError("Diagnosa gagal ditambahkan");
      }
    }

    return diagnoseResult.rows[0];
  }

  async getDummySystemDiagnoses({ historyId, patientId, radiographerId }) {
    const query = {
      text: `UPDATE histories SET system_check_date = $1 WHERE id = $2 RETURNING id, patient_id, radiographer_id, panoramik_picture, upload_date, system_check_date, created_at, updated_at`,
      values: [new Date(), historyId],
    };

    const history = await this._pool.query(query);

    if (!history.rowCount) {
      throw new InvariantError("History gagal ditambahkan");
    }

    const numbers = [
      11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 25, 26, 27, 28, 31, 32, 33,
      35, 36, 37, 38, 41, 42, 43, 45, 46, 47, 48, 51, 52, 53, 55, 61, 62, 63,
      65, 71, 72, 73, 75, 81, 82, 83, 85,
    ];
    const toothNumbers = [];
    const type = ["Karises", "Lesi Periapikal", "Impaksi", "Resorpsi"];

    for (let index = 0; index < Math.floor(Math.random() * 3) + 1; index++) {
      toothNumbers.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }

    let diagnoses = [];

    // map from toothNumbers and insert to diagnoses table
    await Promise.all(
      toothNumbers.map(async (toothNumber) => {
        let diagnoseId = `diagnose-${nanoid(16)}`;
        const query = {
          text: `INSERT INTO diagnoses (id, tooth_number, system_diagnosis, history_id)
                VALUES ($1, $2, $3, $4) RETURNING id, tooth_number, system_diagnosis, history_id`,
          values: [
            diagnoseId,
            toothNumber,
            type[Math.floor(Math.random() * type.length)],
            historyId,
          ],
        };

        let result = await this._pool.query(query);

        diagnoses.push(result.rows[0]);
      })
    );

    return diagnoses;
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

  async verifyAccessRadiographer(credentialId) {
    const query = {
      text: `SELECT * FROM users WHERE id = $1`,
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial anda invalid");
    }

    const { role } = result.rows[0];

    if (role !== "radiographer") {
      throw new AuthenticationError("Anda tidak memiliki akses");
    }
  }
}

module.exports = DiagnosesService;
