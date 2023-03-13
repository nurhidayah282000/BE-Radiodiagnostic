exports.up = (pgm) => {
  pgm.addColumns("patients", {
    medic_number: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    radiographic_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("patients", ["medic_number", "radiographic_id"]);
};
