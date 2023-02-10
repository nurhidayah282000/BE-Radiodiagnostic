exports.up = (pgm) => {
  pgm.createTable('systemradiodiagnosis', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    radiographic_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    system_result: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    verifier_status: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('systemradiodiagnosis');
};
