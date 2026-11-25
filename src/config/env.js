function loadConfig(env = process.env) {
  const uri = env.MONGODB_URI;
  if (!uri) throw new Error('Configure MONGODB_URI no arquivo .env.');
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  return { uri, port, databaseName: env.DB_NAME || 'agenda_compromissos' };
}
module.exports = loadConfig;
