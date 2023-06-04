const routes = (handler) => [
  {
    method: "POST",
    path: "/radiographics/patients/{patientId}",
    handler: handler.postRadiographicHandler,
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
    method: "GET",
    path: "/radiographics/detail/{radiographicId}",
    handler: handler.getRadiographicHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/history/detail/{historyId}",
    handler: handler.getHistoryHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/users/all",
    handler: handler.getAllRadiographicsUserHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/doctors/users/all",
    handler: handler.getAllDoctorsUserHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/all",
    handler: handler.getAllRadiographicsHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/histories/all",
    handler: handler.getAllHistoriesHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/recaps",
    handler: handler.getAllRadiographicsRecapsHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/radiographics/edit/{radiographicId}/picture",
    handler: handler.putRadiographicPictureHandler,
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
    path: "/radiographics/edit/{radiographicId}/doctor",
    handler: handler.putRadiographicDoctorHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/radiographics/edit/{radiographicId}/interpretation",
    handler: handler.putRadiographicInterpretationHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "PUT",
    path: "/radiographics/delete/{radiographicId}/interpretation",
    handler: handler.deleteRadiographicInterpretationHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/radiographics/delete/{radiographicId}",
    handler: handler.deleteRadiographicByIdHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "GET",
    path: "/radiographics/update/{radiographicId}/status",
    handler: handler.updateRadiographicStatusHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
];
module.exports = routes;
