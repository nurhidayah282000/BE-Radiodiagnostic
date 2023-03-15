const routes = (handler) => [
  {
    method: "POST",
    path: "/diagnoses/{radiographicId}/system",
    handler: handler.postSystemDiagonsesHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
  {
    method: "POST",
    path: "/diagnoses/{radiographicId}/manual",
    handler: handler.postManualDiagonsesHandler,
    options: {
      auth: "radiodiagnostic_jwt",
    },
  },
];

module.exports = routes;
