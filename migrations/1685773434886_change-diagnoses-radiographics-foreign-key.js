exports.up = (pgm) => {
  pgm.dropConstraint(
    "diagnoses",
    "fk_diagnoses.radiographic_id_radiographics.id"
  );
  pgm.addConstraint(
    "diagnoses",
    "fk_diagnoses.history_id_histories.id",
    "FOREIGN KEY(history_id) REFERENCES histories(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  s;
  pgm.dropConstraint("diagnoses", "fk_diagnoses.history_id_histories.id");
};
