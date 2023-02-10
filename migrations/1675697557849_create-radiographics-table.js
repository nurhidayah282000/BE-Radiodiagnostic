exports.up = (pgm) => {
  pgm.createTable('radiographics', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    panoramik_picture: {
      type: 'TEXT',
      notNull: true,
    },
    panoramik_upload_date: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    panoramik_check_date: {
      type: 'VARCHAR(50)',
    },
    manual_interpretation: {
      type: 'TEXT',
    },
    status: {
      type: 'INTEGER',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('radiographics');
};
