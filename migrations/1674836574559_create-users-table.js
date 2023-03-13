exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    fullname: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    email: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    password: {
      type: "TEXT",
      notNull: true,
    },
    nip: {
      type: "VARCHAR(30)",
    },
    phone_number: {
      type: "VARCHAR(30)",
    },
    gender: {
      type: "VARCHAR(10)",
    },
    address: {
      type: "TEXT",
    },
    province: {
      type: "VARCHAR(50)",
    },
    city: {
      type: "VARCHAR(50)",
    },
    postal_code: {
      type: "VARCHAR(10)",
    },
    role: {
      type: "VARCHAR(20)",
      notNull: true,
    },
    profile_picture: {
      type: "TEXT",
    },
    status: {
      type: "INTEGER",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};
