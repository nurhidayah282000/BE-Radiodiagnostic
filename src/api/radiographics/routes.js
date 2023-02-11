const routes = (handler) => [
  {
    method: 'POST',
    path: '/radiographics/patients/{patientId}',
    handler: handler.postRadiographicHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 5000000,
      },
    },
  },
  {
    method: 'GET',
    path: '/radiographics/detail/{radiographicId}',
    handler: handler.getRadiographicHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/radiographics/all',
    handler: handler.getAllRadiographicsHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/radiographics/edit/{radiographicId}/picture',
    handler: handler.putRadiographicPictureHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 5000000,
      },
    },
  },
  {
    method: 'PUT',
    path: '/radiographics/edit/{radiographicId}/interpretation',
    handler: handler.putRadiographicInterpretationHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/radiographics/delete/{radiographicId}',
    handler: handler.deleteRadiographicByIdHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
];
module.exports = routes;
