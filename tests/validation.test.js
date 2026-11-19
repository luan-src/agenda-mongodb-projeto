const test = require('node:test');
const assert = require('node:assert/strict');
const { objectId, cleanText, parseDate, validatePeople } = require('../validation');

test('identificador ObjectId válido e inválido', () => {
  assert.ok(objectId('507f1f77bcf86cd799439011'));
  assert.equal(objectId('abc'), null);
});
test('texto limpo e limites aplicados', () => {
  assert.equal(cleanText(' Reunião ', 'Título', 150), 'Reunião');
  assert.throws(() => cleanText('  ', 'Título', 150));
  assert.equal(cleanText('', 'Descrição', 2000, false), '');
});
test('data ISO UTC estrita', () => {
  assert.equal(parseDate('2026-11-19T15:00:00.000Z').toISOString(), '2026-11-19T15:00:00.000Z');
  assert.throws(() => parseDate('2026-02-30T15:00:00.000Z'));
});
test('pessoas distintas como objetos', () => {
  const people = validatePeople([{ nome: ' Ana ' }, { nome: 'Bruno' }]);
  assert.equal(people[0].nome, 'Ana');
  assert.notEqual(people[0].id.toString(), people[1].id.toString());
  assert.throws(() => validatePeople([{ nome: 'Ana' }, { nome: 'ana' }]));
});
