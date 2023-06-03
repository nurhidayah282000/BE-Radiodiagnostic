exports.up = (pgm) => {
  pgm.addColumns("diagnoses", {
    history_id: {
      type: "varchar(50)",
      notNull: true,
    },
  });
};
exports.down = (pgm) => {
  pgm.dropColumns("diagnoses", ["history_id"]);
};
