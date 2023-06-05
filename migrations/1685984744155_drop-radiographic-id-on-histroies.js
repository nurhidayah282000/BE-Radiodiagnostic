exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropConstraint(
    "histories",
    "fk_histories.radiographic_id_radiographics.id"
  );
  pgm.dropColumns("histories", ["radiographic_id"]);
};

exports.down = (pgm) => {
  pgm.addColumns("histories", {
    radiographic_id: {
      type: "varchar(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "histories",
    "fk_histories.radiographic_id_radiographics.id",
    "FOREIGN KEY(radiographic_id) REFERENCES radiographics(id) ON DELETE CASCADE"
  );
};
