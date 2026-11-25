const { Router } = require('express');
module.exports = function createRoutes(controller) {
  const router = Router();
  router.get('/compromissos', controller.listar);
  router.post('/compromissos', controller.criar);
  router.patch('/compromissos/:id', controller.atualizar);
  router.put('/compromissos/:id/pessoas', controller.atualizarPessoas);
  router.delete('/compromissos/:id/pessoas/:pessoaId', controller.removerPessoa);
  router.delete('/compromissos/:id', controller.excluir);
  return router;
};
