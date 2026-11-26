const express = require("express");
const path = require("node:path");
const createModel = require("./models/compromisso.model");
const createService = require("./services/compromisso.service");
const createController = require("./controllers/compromisso.controller");
const createRoutes = require("./routes/compromisso.routes");
const healthRoutes = require("./routes/saude.routes");
const errorMiddleware = require("./middlewares/error.middleware");
function buildApp(collection) {
  return createRoutes(createController(createService(createModel(collection))));
}
function createApp(collection) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "128kb" }));
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use("/api", healthRoutes);
  app.use("/api", buildApp(collection));
  app.use(errorMiddleware);
  return app;
}
module.exports = { createApp, buildApp };
