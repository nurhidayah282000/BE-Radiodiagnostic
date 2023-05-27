/* eslint-disable camelcase */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({
    fullname,
    email,
    password,
    role,
    phone,
    gender,
    address,
    province,
    city,
    post_code,
    nip,
  }) {
    await this.verifyNewEmail(email);

    const id = `${role}-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = 0;
    const query = {
      text: "INSERT INTO users (id, email, fullname, password, role, status, phone_number, gender, address, province, city, postal_code, nip) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, phone_number, fullname, email, profile_picture, role",
      values: [
        id,
        email,
        fullname,
        hashedPassword,
        role,
        status,
        phone,
        gender,
        address,
        province,
        city,
        post_code,
        nip,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("User gagal ditambahkan");
    }
    return result.rows[0];
  }

  async getUserTotalRows(search) {
    let queryText =
      "SELECT COUNT(*) as total_rows, role FROM users WHERE role IN ('doctor','radiographer') group by role";

    let queryParams = [];
    if (search) {
      queryText =
        "SELECT COUNT(*) as total_rows, role FROM users WHERE (LOWER(fullname) LIKE $1 OR LOWER(nip) LIKE $1) AND role IN ('doctor','radiographer') group by role";
      queryParams = [`%${search.toLowerCase()}%`];
    }

    const query = {
      text: queryText,
      values: queryParams,
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getAllUsers(limit, offset, search) {
    let queryText = "SELECT * FROM users";

    const queryParams = [limit, offset];

    if (search) {
      queryText +=
        " WHERE (LOWER(fullname) LIKE $3 OR LOWER(nip) LIKE $3) AND role IN ('doctor','radiographer')";
      queryParams.push(`%${search.toLowerCase()}%`);
    } else {
      queryText += " WHERE role IN ('doctor','radiographer')";
    }

    queryText += " LIMIT $1 OFFSET $2";

    const query = {
      text: queryText,
      values: queryParams,
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows;
  }

  async getUserById(userId) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows[0];
  }

  async editUser(
    userId,
    {
      fullname,
      email,
      phone_number,
      gender,
      address,
      province,
      city,
      postal_code,
      nip,
    }
  ) {
    const query = {
      text: `UPDATE users 
      SET fullname = $1, email = $2, phone_number = $3, 
      gender = $4, address = $5,
      province = $6, city = $7, postal_code = $8, nip = $9
      WHERE id = $10 RETURNING id`,
      values: [
        fullname,
        email,
        phone_number,
        gender,
        address,
        province,
        city,
        postal_code,
        nip,
        userId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("User gagal diperbarui");
    }
    return result.rows[0];
  }

  async editUserById(
    userId,
    {
      fullname,
      email,
      phone_number,
      gender,
      address,
      province,
      city,
      postal_code,
      role,
      nip,
    }
  ) {
    const query = {
      text: `UPDATE users 
      SET fullname = $1, email = $2, phone_number = $3, 
      gender = $4, address = $5,
      province = $6, city = $7, postal_code = $8, role = $9, nip = $10
      WHERE id = $11 RETURNING id`,
      values: [
        fullname,
        email,
        phone_number,
        gender,
        address,
        province,
        city,
        postal_code,
        role,
        nip,
        userId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("User gagal diperbarui");
    }
    return result.rows[0];
  }

  async editUserPicture(userId, pictureUrl) {
    const query = {
      text: "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING profile_picture",
      values: [pictureUrl, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("User profile gagal diperbarui");
    }
    return result.rows[0];
  }

  async editUserPassword(userId, password) {
    const status = 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: "UPDATE users SET password = $1, status =$2 WHERE id = $3 RETURNING id",
      values: [hashedPassword, status, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("User password gagal diperbarui");
    }
    return result.rows[0].id;
  }

  async verifyNewEmail(email) {
    const query = {
      text: "SELECT email FROM users WHERE email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        "Gagal menambahkan/memperbarui user. Email sudah digunakan."
      );
    }
  }

  async deleteUserById(id) {
    const query = {
      text: "DELETE FROM users WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User gagal dihapus. Id tidak ditemukan");
    }
  }

  async getUserRoleByEmail(userEmail) {
    const query = {
      text: "SELECT role FROM users WHERE email = $1",
      values: [userEmail],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows[0].role;
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE email = $1",
      values: [email],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }
    return id;
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
    if (role !== "admin") {
      throw new AuthenticationError("Anda tidak memilki akeses");
    }
  }

  async verifyNewPassword(
    credentialId,
    password,
    newPassword,
    newPasswordConfirmation
  ) {
    const query = {
      text: "SELECT id, password FROM users WHERE id = $1",
      values: [credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("User tidak ditemukan");
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    if (newPassword !== newPasswordConfirmation) {
      throw new InvariantError("Konfirmasi password baru tidak sesuai");
    }

    return id;
  }
}

module.exports = UsersService;
