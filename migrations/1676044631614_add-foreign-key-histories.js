exports.up = (pgm) => {
  pgm.addConstraint('histories', 'fk_histories.patient_id_patients.id', 'FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE');
  pgm.addConstraint('histories', 'fk_histories.doctor_id_users.id', 'FOREIGN KEY(doctor_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('histories', 'fk_histories.radiographer_id_users.id', 'FOREIGN KEY(radiographer_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('histories', 'fk_histories.radiographic_id_radiographics.id', 'FOREIGN KEY(radiographic_id) REFERENCES radiographics(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('histories', 'fk_histories.patient_id_patients.id');
  pgm.dropConstraint('histories', 'fk_histories.doctor_id_users.id');
  pgm.dropConstraint('histories', 'fk_histories.radiographer_id_users.id');
  pgm.dropConstraint('histories', 'fk_histories.radiographic_id_radiographics.id');
};
