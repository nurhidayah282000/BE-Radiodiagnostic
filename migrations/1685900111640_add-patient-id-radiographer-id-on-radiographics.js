exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("radiographics", {
    patient_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    radiographer_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("radiographics", ["patient_id", "raiographer_id"]);
};
