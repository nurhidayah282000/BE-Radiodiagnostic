exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    fullname: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    email: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    phone_number: {
      type: 'VARCHAR(30)',
    },
    gender: {
      type: 'VARCHAR(10)',
    },
    profession: {
      type: 'VARCHAR(50)',
    },
    address: {
      type: 'TEXT',
    },
    province: {
      type: 'VARCHAR(50)',
    },
    city: {
      type: 'VARCHAR(50)',
    },
    postal_code: {
      type: 'VARCHAR(10)',
    },
    role: {
      type: 'VARCHAR(20)',
      notNull: true,
    },
    profile_picture: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
