exports.up = (pgm) => {
    pgm.addConstraint('diagnoses', 'fk_diagnoses.radiographic_id_radiographics.id', 'FOREIGN KEY(radiographic_id) REFERENCES radiographics(id) ON DELETE CASCADE');
  };
  
  exports.down = (pgm) => {s
    pgm.dropConstraint('diagnoses', 'fk_diagnoses.radiographic_id_radiographics.id');
  };
  