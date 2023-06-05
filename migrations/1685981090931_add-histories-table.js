exports.up = (pgm) => {
  pgm.addColumns("histories", {
    panoramik_check_date: {
      type: "varchar(50)",
    },
    status: {
      type: "INTEGER",
    },
  });
};
exports.down = (pgm) => {
  pgm.dropColumns("histories", ["panoramik_check_date", "status"]);
};
