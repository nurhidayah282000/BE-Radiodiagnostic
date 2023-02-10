exports.up = (pgm) => {
  pgm.addConstraint('systemradiodiagnosis', 'fk_systemradiodiagnosis.radiographic_id_radiographics.id', 'FOREIGN KEY(radiographic_id) REFERENCES radiographics(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('systemradiodiagnosis', 'fk_systemradiodiagnosis.radiographic_id_radiographics.id');
};
