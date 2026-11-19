const { ObjectId } = require('mongodb');

function objectId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value) ? new ObjectId(value) : null;
}

function cleanText(value, field, max, required = true) {
  if (typeof value !== 'string') throw new Error(`${field} deve ser um texto.`);
  const cleaned = value.trim();
  if ((required && !cleaned) || cleaned.length > max) {
    throw new Error(`${field} deve ter ${required ? 'entre 1 e ' : 'no máximo '}${max} caracteres.`);
  }
  return cleaned;
}

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new Error('Informe uma data e horário válidos em formato ISO UTC.');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value) throw new Error('Data e horário inválidos.');
  return date;
}

function validatePeople(value) {
  if (!Array.isArray(value) || value.length > 50) throw new Error('Informe uma lista de até 50 pessoas.');
  const people = value.map((person) => ({ id: new ObjectId(), nome: cleanText(person?.nome, 'Nome da pessoa', 120) }));
  const unique = new Set(people.map(person => person.nome.toLocaleLowerCase('pt-BR')));
  if (unique.size !== people.length) throw new Error('Não repita nomes de pessoas no mesmo compromisso.');
  return people;
}

module.exports = { objectId, cleanText, parseDate, validatePeople };
