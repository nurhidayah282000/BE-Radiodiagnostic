exports.up = (pgm) => {
  pgm.createTable('patients', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    fullname: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    id_number: {
      type: 'VARCHAR(16)',
      notNull: true,
    },
    gender: {
      type: 'VARCHAR(10)',
      notNull: true,
    },
    religion: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    address: {
      type: 'TEXT',
      notNull: true,
    },
    born_location: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    born_date: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    age: {
      type: 'INTEGER',
    },
    phone_number: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    referral_origin: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
