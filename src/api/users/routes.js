const routes = (handler) => [
  {
    method: "POST",
    path: "/users",
    handler: handler.postUserHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/users/profile",
    handler: handler.getUserHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/users/profile/{userId}",
    handler: handler.getUserByIdHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/users/all",
    handler: handler.getAllUsersHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/users/edit/profile",
    handler: handler.putUserHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/users/edit/profile/{userId}",
    handler: handler.putUserbyIdHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/users/edit/picture",
    handler: handler.putUserPictureHandler,
    options: {
      auth: "radiodiagnostic_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 5000000,
      },
    },
  },
  {
    method: "PUT",
    path: "/users/edit/password",
    handler: handler.putUserPasswordHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/users/delete/{userId}",
    handler: handler.deleteUserByIdHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
];
module.exports = routes;
