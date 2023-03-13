exports.up = (pgm) => {
    pgm.addConstraint('patients', 'fk_patient.radiographic_id_users.id', 'FOREIGN KEY(radiographic_id) REFERENCES users(id) ON DELETE CASCADE');
  };
  
  exports.down = (pgm) => {s
    pgm.dropConstraint('patients', 'fk_patient.radiographic_id_users.id');
  };
  