const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, {
    usersService, storageService, UsersValidator, UploadsValidator,
  }) => {
    const usersHandler = new UsersHandler(
      usersService,
      storageService,
      UsersValidator,
      UploadsValidator,
    );
    server.route(routes(usersHandler));
  },
};
