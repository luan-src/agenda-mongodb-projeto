const loadConfig = require('./src/config/env');
const connectDatabase = require('./src/config/database');
const { createApp, buildApp } = require('./src/app');
async function start() {
  require('dotenv').config({ quiet: true });
  const config = loadConfig();
  const { client, collection } = await connectDatabase(config);
  const app = createApp(collection);
  const server = app.listen(config.port, () => console.log(`Agenda pronta em http://localhost:${config.port}`));
  server.once('error', async error => { console.error('Falha ao iniciar:', error.message); await client.close(); process.exitCode = 1; });
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(async () => { try { await client.close(); } catch (error) { console.error(error); process.exitCode = 1; } });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}
if (require.main === module) start().catch(error => { console.error('Falha ao iniciar:', error.message); process.exitCode = 1; });
module.exports = { start, buildApp, createApp };
