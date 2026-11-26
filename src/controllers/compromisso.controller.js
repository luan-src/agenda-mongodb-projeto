module.exports = function createController(service) {
  return {
    async listar(req, res) {
      res.json(await service.listar());
    },
    async criar(req, res) {
      res.status(201).json(await service.criar(req.body));
    },
    async atualizar(req, res) {
      res.json(await service.atualizar(req.params.id, req.body));
    },
    async atualizarPessoas(req, res) {
      res.json(await service.atualizarPessoas(req.params.id, req.body));
    },
    async removerPessoa(req, res) {
      res.json(await service.removerPessoa(req.params.id, req.params.pessoaId));
    },
    async excluir(req, res) {
      await service.excluir(req.params.id);
      res.status(204).end();
    },
  };
};
