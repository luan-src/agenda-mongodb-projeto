const AppError = require("../utils/app-error");
module.exports = function errorMiddleware(error, _req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof AppError)
    return res.status(error.status).json({ erro: error.message });
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ erro: "JSON inválido." });
  if (error.type === "entity.too.large")
    return res.status(413).json({ erro: "Requisição muito grande." });
  console.error("Erro interno:", error);
  return res.status(500).json({ erro: "Erro interno do servidor." });
};
