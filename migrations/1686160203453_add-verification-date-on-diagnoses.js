exports.up = (pgm) => {
  pgm.addColumns("diagnoses", {
    verification_date: {
      type: "timestamp",
      notNull: false,
    },
  });
};
exports.down = (pgm) => {
  pgm.dropColumns("diagnoses", ["verification_date"]);
};
