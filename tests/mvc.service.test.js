const test = require("node:test");
const assert = require("node:assert/strict");
const createService = require("../src/services/compromisso.service");
const id = "507f1f77bcf86cd799439011";
const personId = "507f1f77bcf86cd799439012";
const now = new Date("2026-11-25T12:00:00.000Z");
const valid = {
  titulo: " Reunião ",
  dataHorario: now.toISOString(),
  pessoas: [{ nome: "Ana" }],
};
const service = (model) => createService(model, () => now);
test("cadastro valida e prepara documento", async () => {
  const result = await service({ criar: async (data) => data }).criar(valid);
  assert.equal(result.titulo, "Reunião");
  assert.equal(result.descricao, "");
  assert.equal(result.pessoas[0].nome, "Ana");
  assert.equal(result.criadoEm, now);
});
test("cadastro inválido não acessa model", async () => {
  await assert.rejects(
    service({ criar: () => assert.fail("Não deveria gravar") }).criar({
      ...valid,
      titulo: "",
    }),
    { status: 400 },
  );
});
test("patch altera apenas campos autorizados", async () => {
  const result = await service({
    atualizar: async (key, data) => {
      assert.equal(String(key), id);
      return data;
    },
  }).atualizar(id, { titulo: "Novo", pessoas: [], _id: "outro" });
  assert.deepEqual(result, { titulo: "Novo", atualizadoEm: now });
});
test("patch vazio e id inválido retornam 400", async () => {
  await assert.rejects(service({}).atualizar(id, {}), { status: 400 });
  await assert.rejects(service({}).excluir("abc"), { status: 400 });
});
test("compromisso inexistente retorna 404", async () => {
  await assert.rejects(
    service({ atualizar: async () => null }).atualizar(id, { titulo: "Novo" }),
    { status: 404 },
  );
  await assert.rejects(service({ excluir: async () => false }).excluir(id), {
    status: 404,
  });
});
test("substituição de pessoas preserva regra original de novos IDs", async () => {
  const result = await service({
    atualizar: async (_, data) => data,
  }).atualizarPessoas(id, { pessoas: [{ id: personId, nome: "Ana" }] });
  assert.notEqual(String(result.pessoas[0].id), personId);
});
test("exclusão individual encaminha os dois IDs", async () => {
  const result = await service({
    removerPessoa: async (a, b) => {
      assert.equal(String(a), id);
      assert.equal(String(b), personId);
      return { pessoas: [] };
    },
  }).removerPessoa(id, personId);
  assert.deepEqual(result.pessoas, []);
});
