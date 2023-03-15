exports.up = (pgm) => {
  pgm.createTable("diagnoses", {
    id: {
      type: "varchar(50)",
      primaryKey: true,
    },
    radiographic_id: {
      type: "varchar(50)",
      notNull: true,
    },
    tooth_number: {
        type: "INTEGER",
        notNull: true,
    },
    system_diagnosis: {
        type: "VARCHAR(50)",
    },
    is_corerct: {
        type: "INTEGER",
    },
    verificator_diagnosis: {
        type: "VARCHAR(50)",
    },
    verificator_note: {
        type: "TEXT",
    },
    manual_diagnosis: {
        type: "VARCHAR(50)",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("diagnoses");
};
