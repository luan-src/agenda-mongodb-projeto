const { ObjectId } = require("mongodb");
const AppError = require("../utils/app-error");
function objectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value)
    ? new ObjectId(value)
    : null;
}
function cleanText(value, field, max, required = true) {
  if (typeof value !== "string")
    throw new AppError(`${field} deve ser um texto.`);
  const text = value.trim();
  if ((required && !text) || text.length > max)
    throw new AppError(
      `${field} deve ter ${required ? "entre 1 e " : "no máximo "}${max} caracteres.`,
    );
  return text;
}
function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
    throw new AppError(
      "Informe uma data e horário válidos em formato ISO UTC.",
    );
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value)
    throw new AppError("Data e horário inválidos.");
  return date;
}
function validatePeople(value) {
  if (!Array.isArray(value) || value.length > 50)
    throw new AppError("Informe uma lista de até 50 pessoas.");
  const people = value.map((person) => ({
    id: new ObjectId(),
    nome: cleanText(person?.nome, "Nome da pessoa", 120),
  }));
  if (
    new Set(people.map((p) => p.nome.toLocaleLowerCase("pt-BR"))).size !==
    people.length
  )
    throw new AppError("Não repita nomes de pessoas no mesmo compromisso.");
  return people;
}
module.exports = { objectId, cleanText, parseDate, validatePeople };
