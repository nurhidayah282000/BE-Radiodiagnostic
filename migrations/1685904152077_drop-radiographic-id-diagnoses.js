exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumns("diagnoses", ["radiographic_id"]);
};

exports.down = (pgm) => {
  pgm.addColumns("diagnoses", {
    radiographic_id: {
      type: "varchar(50)",
      notNull: true,
    },
  });
};
