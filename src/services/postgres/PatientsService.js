/* eslint-disable camelcase */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class PatientsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPatient({
    fullname, idNumber, gender, religion,
    address, bornLocation, bornDate,
    phoneNumber, referralOrigin,
  }) {
    const new_born_date = Date.parse(`${bornDate} GMT`);
    const age_dif = Date.now() - new_born_date;
    const age_date = new Date(age_dif);
    const age = Math.abs(age_date.getUTCFullYear() - 1970).toString();

    const id = `patient-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO patients (id, fullname, id_number,
        gender, religion, address, born_location,
        born_date, age, phone_number, referral_origin)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, fullname, fullname, id_number`,
      values: [id, fullname, idNumber,
        gender, religion, address, bornLocation,
        bornDate, age, phoneNumber, referralOrigin],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Pasien gagal ditambahkan');
    }
    return result.rows[0];
  }

  async getAllPatients() {
    const query = {
      text: 'SELECT * FROM patients',
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Pasien tidak ditemukan');
    }

    return result.rows;
  }

  async getPatientById(patientId) {
    const query = {
      text: 'SELECT * FROM patients WHERE id = $1',
      values: [patientId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Pasien tidak ditemukan');
    }

    return result.rows[0];
  }

  async editPatient(
    patientId,
    {
      fullname, idNumber, gender, religion,
      address, bornLocation, bornDate,
      phoneNumber, referralOrigin,
    },
  ) {
    const query = {
      text: `UPDATE patients 
      SET fullname = $1, id_number = $2, gender = $3,
      religion =$4, address = $5, born_location = $6, born_date = $7, 
      phone_number = $8, referral_origin = $9
      WHERE id = $10 RETURNING id`,
      values: [fullname, idNumber, gender,
        religion, address, bornLocation,
        bornDate, phoneNumber, referralOrigin, patientId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Pasien gagal diperbarui');
    }
    return result.rows[0];
  }

  async deletePatientById(id) {
    const query = {
      text: 'DELETE FROM patients WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Pasien gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyUserAccessRadiographer(credentialId) {
    const query = {
      text: 'SELECT role FROM users WHERE id = $1',
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial anda invalid');
    }

    const { role } = result.rows[0];

    if (role !== 'radiographer') {
      throw new AuthenticationError('Anda tidak memilki akeses');
    }
  }

  async verifyUserAccessDoctor(credentialId) {
    const query = {
      text: 'SELECT role FROM users WHERE id = $1',
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial anda invalid');
    }

    const { role } = result.rows[0];

    if (role !== 'radiographer') {
      throw new AuthenticationError('Anda tidak memilki akeses');
    }
  }

  async verifyNewIdNumber(idNumber) {
    const query = {
      text: 'SELECT id_number FROM patients WHERE id_number = $1',
      values: [idNumber],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan/memperbarui pasien. Pasien sudah terdaftar.');
    }
  }
}

module.exports = PatientsService;
