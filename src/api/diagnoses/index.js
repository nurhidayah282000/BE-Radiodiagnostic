const DiagnosesHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "diagnoses",
  version: "1.0.0",
  register: async (server, { diagnosesService, radiographicsService }) => {
    const diagnosesHandler = new DiagnosesHandler(diagnosesService, radiographicsService);
    server.route(routes(diagnosesHandler));
  },
};
