exports.up = (pgm) => {
    pgm.addColumns("histories", {
      system_check_date: {
        type: "varchar(50)",
      },
    });
  };
  exports.down = (pgm) => {
    pgm.dropColumns("histories", ["system_check_date"]);
  };
  