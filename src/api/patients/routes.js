const routes = (handler) => [
  {
    method: 'POST',
    path: '/patients',
    handler: handler.postPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patients/detail/{patientId}',
    handler: handler.getPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patients/all',
    handler: handler.getAllPatientsHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patient/all',
    handler: handler.getAllPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/patients/edit/{patientId}',
    handler: handler.putPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/patients/delete/{patientId}',
    handler: handler.deletePatientByIdHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
];
module.exports = routes;
