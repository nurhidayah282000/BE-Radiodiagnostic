exports.up = (pgm) => {
  pgm.addColumns("patients", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("patients", ["created_at", "updated_at"])
};
