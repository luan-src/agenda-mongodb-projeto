const { objectId, cleanText, parseDate, validatePeople } = require('../validators/compromisso.validator');
const AppError = require('../utils/app-error');
function id(value, label = 'compromisso') {
  const parsed = objectId(value);
  if (!parsed) throw new AppError(`Identificador de ${label} inválido.`);
  return parsed;
}
function found(value, message = 'Compromisso não encontrado.') {
  if (!value) throw new AppError(message, 404);
  return value;
}
function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError('Informe um objeto JSON válido.');
  return body;
}
module.exports = function createService(model, clock = () => new Date()) {
  return {
    listar: () => model.listar(),
    async criar(body) {
      const { dataHorario, titulo, descricao = '', pessoas = [] } = bodyObject(body);
      const now = clock();
      return model.criar({ dataHorario: parseDate(dataHorario), titulo: cleanText(titulo, 'Título', 150), descricao: cleanText(descricao, 'Descrição', 2000, false), pessoas: validatePeople(pessoas), criadoEm: now, atualizadoEm: now });
    },
    async atualizar(rawId, body) {
      const _id = id(rawId); bodyObject(body);
      const changes = {};
      if ('titulo' in body) changes.titulo = cleanText(body.titulo, 'Título', 150);
      if ('descricao' in body) changes.descricao = cleanText(body.descricao, 'Descrição', 2000, false);
      if ('dataHorario' in body) changes.dataHorario = parseDate(body.dataHorario);
      if (!Object.keys(changes).length) throw new AppError('Envie título, descrição ou data/horário.');
      return found(await model.atualizar(_id, { ...changes, atualizadoEm: clock() }));
    },
    async atualizarPessoas(rawId, body) {
      const _id = id(rawId); bodyObject(body);
      if (!('pessoas' in body)) throw new AppError('Informe as pessoas.');
      return found(await model.atualizar(_id, { pessoas: validatePeople(body.pessoas), atualizadoEm: clock() }));
    },
    async removerPessoa(rawId, rawPersonId) {
      return found(await model.removerPessoa(id(rawId), id(rawPersonId, 'pessoa'), clock()), 'Compromisso ou pessoa não encontrada.');
    },
    async excluir(rawId) { found(await model.excluir(id(rawId))); }
  };
};
