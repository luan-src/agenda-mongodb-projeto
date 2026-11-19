require('dotenv').config({ quiet: true });
const path = require('node:path');
const express = require('express');
const { MongoClient } = require('mongodb');
const { objectId, cleanText, parseDate, validatePeople } = require('./validation');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '128kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function buildApp(collection) {
  const router = express.Router();
  const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
  const findId = (req) => {
    const id = objectId(req.params.id);
    if (!id) throw Object.assign(new Error('Identificador de compromisso inválido.'), { status: 400 });
    return id;
  };
  const findPersonId = (req) => {
    const id = objectId(req.params.pessoaId);
    if (!id) throw Object.assign(new Error('Identificador de pessoa inválido.'), { status: 400 });
    return id;
  };

  router.get('/compromissos', asyncRoute(async (_req, res) => {
    const events = await collection.find({}).sort({ dataHorario: 1, _id: 1 }).limit(1000).toArray();
    res.json(events);
  }));

  router.post('/compromissos', asyncRoute(async (req, res) => {
    const { dataHorario, titulo, descricao = '', pessoas = [] } = req.body || {};
    const now = new Date();
    const event = {
      dataHorario: parseDate(dataHorario),
      titulo: cleanText(titulo, 'Título', 150),
      descricao: cleanText(descricao, 'Descrição', 2000, false),
      pessoas: validatePeople(pessoas),
      criadoEm: now,
      atualizadoEm: now
    };
    const result = await collection.insertOne(event);
    res.status(201).json({ _id: result.insertedId, ...event });
  }));

  router.patch('/compromissos/:id', asyncRoute(async (req, res) => {
    const _id = findId(req);
    const body = req.body || {};
    const changes = {};
    if ('titulo' in body) changes.titulo = cleanText(body.titulo, 'Título', 150);
    if ('descricao' in body) changes.descricao = cleanText(body.descricao, 'Descrição', 2000, false);
    if ('dataHorario' in body) changes.dataHorario = parseDate(body.dataHorario);
    if (!Object.keys(changes).length) return res.status(400).json({ erro: 'Envie título, descrição ou data/horário.' });
    changes.atualizadoEm = new Date();
    const result = await collection.updateOne({ _id }, { $set: changes });
    if (!result.matchedCount) return res.status(404).json({ erro: 'Compromisso não encontrado.' });
    res.json(await collection.findOne({ _id }));
  }));

  router.put('/compromissos/:id/pessoas', asyncRoute(async (req, res) => {
    const _id = findId(req);
    if (!req.body || !('pessoas' in req.body)) return res.status(400).json({ erro: 'Informe as pessoas.' });
    const people = validatePeople(req.body.pessoas);
    const result = await collection.updateOne({ _id }, { $set: { pessoas: people, atualizadoEm: new Date() } });
    if (!result.matchedCount) return res.status(404).json({ erro: 'Compromisso não encontrado.' });
    res.json(await collection.findOne({ _id }));
  }));

  router.delete('/compromissos/:id/pessoas/:pessoaId', asyncRoute(async (req, res) => {
    const _id = findId(req);
    const pessoaId = findPersonId(req);
    const result = await collection.updateOne({ _id, 'pessoas.id': pessoaId }, {
      $pull: { pessoas: { id: pessoaId } }, $set: { atualizadoEm: new Date() }
    });
    if (!result.matchedCount) return res.status(404).json({ erro: 'Compromisso ou pessoa não encontrada.' });
    res.json(await collection.findOne({ _id }));
  }));

  router.delete('/compromissos/:id', asyncRoute(async (req, res) => {
    const result = await collection.deleteOne({ _id: findId(req) });
    if (!result.deletedCount) return res.status(404).json({ erro: 'Compromisso não encontrado.' });
    res.status(204).end();
  }));

  return router;
}

app.get('/api/saude', (_req, res) => res.json({ status: 'ok' }));


async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Configure MONGODB_URI no arquivo .env.');
  const databaseName = process.env.DB_NAME || 'agenda_compromissos';
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const collection = client.db(databaseName).collection('compromissos');
  await collection.createIndex({ dataHorario: 1 });
  app.use('/api', buildApp(collection));
  app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  if (error.message && (error.message.startsWith('Informe ') || error.message.includes('deve ') || error.message.includes('inválid') || error.message.includes('repita'))) {
    return res.status(error.status || 400).json({ erro: error.message });
  }
  console.error('Erro interno:', error);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

  const server = app.listen(port, () => console.log(`Agenda pronta em http://localhost:${port}`));
  const shutdown = () => server.close(() => client.close().finally(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) start().catch(error => { console.error('Falha ao iniciar:', error.message); process.exit(1); });
module.exports = { buildApp };
