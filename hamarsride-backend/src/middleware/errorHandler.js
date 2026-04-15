function errorHandler(err, req, res, _next) {
  if (err) {
    console.error("API error:", {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }
  if (err && err.name === "ZodError") {
    return res.status(400).json({ error: "Invalid request", details: err.errors });
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
