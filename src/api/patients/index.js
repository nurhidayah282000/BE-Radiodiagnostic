const PatientsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'patients',
  version: '1.0.0',
  register: async (server, {
    patientsService, PatientsValidator,
  }) => {
    const patientsHandler = new PatientsHandler(
      patientsService,
      PatientsValidator,
    );
    server.route(routes(patientsHandler));
  },
};
