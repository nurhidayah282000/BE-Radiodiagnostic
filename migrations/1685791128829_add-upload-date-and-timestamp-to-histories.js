exports.up = (pgm) => {
  pgm.addColumns("histories", {
    upload_date: {
      type: "VARCHAR(50)",
      notNull: false,
    },
    created_at: {
      type: "timestamp",
      notNull: false,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: false,
      default: pgm.func("current_timestamp"),
    },
  });
};
exports.down = (pgm) => {
  pgm.dropColumns("histories", ["upload_date", "created_at", "updated_at"]);
};
