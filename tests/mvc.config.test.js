const test = require("node:test");
const assert = require("node:assert/strict");
const load = require("../src/config/env");
test("configuração padrão", () =>
  assert.deepEqual(load({ MONGODB_URI: "mongodb://localhost" }), {
    uri: "mongodb://localhost",
    databaseName: "agenda_compromissos",
    port: 3000,
  }));
test("configuração inválida", () => {
  assert.throws(() => load({}));
  assert.throws(() => load({ MONGODB_URI: "x", PORT: "65536" }));
});
