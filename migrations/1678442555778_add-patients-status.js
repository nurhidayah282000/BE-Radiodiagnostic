exports.up = (pgm) => {
  pgm.addColumns("patients", {
    status: {
      type: "INTEGER",
      notNull: true,
      default: 0,
    },
  });
};
exports.down = (pgm) => {
  pgm.dropColumns("patients", ["status"]);
};
