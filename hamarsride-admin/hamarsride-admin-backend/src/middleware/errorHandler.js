const errorHandler = (err, _req, res, _next) => {
  if (err && err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.issues,
    });
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ error: message });
};

module.exports = errorHandler;
