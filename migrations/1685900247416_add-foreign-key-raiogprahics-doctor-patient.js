exports.up = (pgm) => {
  pgm.addConstraint(
    "radiographics",
    "fk_radiographics.patient_id_patients.id",
    "FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE"
  );
  pgm.addConstraint(
    "radiographics",
    "fk_radiographics.radiographer_id_users.id",
    "FOREIGN KEY(radiographer_id) REFERENCES users(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    "radiographics",
    "fk_radiographics.patient_id_patients.id"
  );
  pgm.dropConstraint(
    "radiographics",
    "fk_radiographics.radiographer_id_users.id"
  );
};
