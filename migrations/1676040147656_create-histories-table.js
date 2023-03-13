exports.up = (pgm) => {
  pgm.createTable('histories', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    patient_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    doctor_id: {
      type: 'VARCHAR(50)',
    },
    radiographer_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    radiographic_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('histories');
};
