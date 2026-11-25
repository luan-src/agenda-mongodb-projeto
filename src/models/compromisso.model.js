module.exports = function createModel(collection) {
  return {
    listar: () => collection.find({}).sort({ dataHorario: 1, _id: 1 }).limit(1000).toArray(),
    async criar(event) {
      const result = await collection.insertOne(event);
      return { ...event, _id: result.insertedId };
    },
    atualizar: (_id, changes) => collection.findOneAndUpdate({ _id }, { $set: changes }, { returnDocument: 'after', includeResultMetadata: false }),
    removerPessoa: (_id, pessoaId, atualizadoEm) => collection.findOneAndUpdate(
      { _id, 'pessoas.id': pessoaId },
      { $pull: { pessoas: { id: pessoaId } }, $set: { atualizadoEm } },
      { returnDocument: 'after', includeResultMetadata: false }
    ),
    async excluir(_id) { return (await collection.deleteOne({ _id })).deletedCount > 0; }
  };
};
