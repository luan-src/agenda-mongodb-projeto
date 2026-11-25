const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
test('HTTP: saúde, listagem, criação, validação e exclusão', async t => {
  const id = '507f1f77bcf86cd799439011';
  const collection = {
    find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
    insertOne: async () => ({ insertedId: id }),
    findOneAndUpdate: async () => null,
    deleteOne: async () => ({ deletedCount: 1 })
  };
  const server = createApp(collection).listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  if (!server.listening) await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const req = (route, method = 'GET', body) => fetch(base + route, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  assert.deepEqual(await (await req('/saude')).json(), { status: 'ok' });
  assert.deepEqual(await (await req('/compromissos')).json(), []);
  const created = await req('/compromissos', 'POST', { titulo: 'Teste', dataHorario: '2026-11-25T12:00:00.000Z' });
  assert.equal(created.status, 201); assert.equal((await created.json())._id, id);
  assert.equal((await req('/compromissos', 'POST', {})).status, 400);
  assert.equal((await req('/compromissos/' + id, 'PATCH', { titulo: 'Novo' })).status, 404);
  assert.equal((await req('/compromissos/' + id, 'DELETE')).status, 204);
});
