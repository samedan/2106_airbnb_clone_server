exports.provideErrorHandler = (req, res, next) => {
  // Errors coming from the API
  res.sendApiError = (config) => {
    const { status = 422, title, detail } = config;
    return res.status(status).send({ errors: [{ title, detail }] });
  };

  // Errors coming from Mongo Atlas
  res.mongoError = (dbError) => {
    const normalizedErrors = [];
    const errorField = "errors";

    if (
      dbError &&
      dbError.hasOwnProperty(errorField) &&
      dbError.name === "ValidationError"
    ) {
      const errors = dbError[errorField];
      for (let property in errors) {
        normalizedErrors.push({
          title: property,
          detail: errors[property].message,
        });
      }
    } else {
      normalizedErrors.push({
        title: "Db Error",
        detail: "Ooops, something went wrong!",
      });
    }

    return res.status(422).send({ errors: normalizedErrors });
  };

  next();
};
