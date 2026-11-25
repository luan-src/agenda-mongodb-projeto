# Agenda MongoDB — refatoração MVC

Pacote de atualização para https://github.com/luan-src/agenda-mongodb-projeto (branch main). Não é um projeto autônomo: preserve os arquivos originais `public/`, `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `README.md` e os testes existentes.

## Instalação

1. Faça backup do diretório original e do banco de dados. Não publique `.env`.
2. Extraia este ZIP na raiz do projeto original, substituindo `server.js` e `validation.js` e mesclando `tests/`.
3. Execute `node tools/separar-view.js` para separar a comunicação HTTP do JavaScript visual e reorganizar o CSS. O script mantém os arquivos estáticos antigos como backup. Caso a interface tenha sido alterada, o script interrompe antes de escrever se não reconhecer os marcadores esperados.
4. Execute `npm ci` (ou `npm install` se o lockfile não estiver disponível).
5. Se ainda não existir, crie `.env` a partir de `.env.example`, informando `MONGODB_URI`, `DB_NAME` e `PORT`. Use o banco de testes inicialmente.
6. Execute `npm test` e depois `npm start`. Abra http://localhost:3000 (ou a porta configurada).

## Arquitetura

- `server.js`: inicialização e encerramento do servidor.
- `src/app.js`: composição da aplicação Express.
- `src/config/`: ambiente e conexão MongoDB.
- `src/routes/`: endpoints REST e saúde.
- `src/controllers/`: entrada e saída HTTP.
- `src/services/`: regras de negócio e coordenação.
- `src/models/`: operações de persistência, com dependência da coleção injetada.
- `src/validators/`: validações de texto, data, pessoas e IDs.
- `src/middlewares/`: tratamento centralizado de erros. Express 5 encaminha rejeições de promises automaticamente.
- `src/utils/`: erro tipado.
- `public/`: View estática. O utilitário separa `js/api.js`, `js/app.js` e `css/style.css` sem reconstruir a interface.
- `validation.js`: fachada para compatibilidade com os testes antigos.
- `tests/`: testes originais e novos testes de configuração, serviços e HTTP com coleção simulada.

Fluxo: View → Routes → Controller → Service → Model → MongoDB. O Service utiliza os Validators; os erros chegam ao middleware.

## Compatibilidade e decisões

Mantidos os sete endpoints, campos BSON, coleção `compromissos`, índice de data, limite de 1000 resultados, IDs de pessoas recriados no PUT, formato `erro` e códigos HTTP esperados nas operações válidas. Não há migração de dados. O Model usa `findOneAndUpdate` com retorno do documento atualizado para evitar a consulta separada após alteração. JSON acima do limite retorna 413 e corpos que não são objetos são rejeitados com 400. Não foram adicionadas dependências. Não foram implementadas autenticação, paginação nem alteração das regras de participantes. A aplicação continua destinada a uso acadêmico/local.

## Verificação

Neste ambiente Node 22.16.0: sintaxe de todos os arquivos JavaScript verificada; dois testes de configuração passaram. A clonagem e instalação de dependências não foram possíveis por restrição de rede. Os demais testes foram escritos, mas precisam ser executados no ambiente do projeto. A interface original é reutilizada e a ferramenta de separação deve ser executada localmente. Não houve teste real com MongoDB.

Após `npm test`, verifique manualmente: criar, listar, filtrar, editar, substituir participantes, remover participante, excluir compromisso, recarregar a página e conferir a persistência. Use um banco de teste para evitar alterações em dados reais. Verifique também GET /api/saude.

## Reversão

Restaure o diretório original do backup (incluindo index.html), preservando seu `.env`. Não é necessário restaurar o banco apenas para reverter a arquitetura; caso tenham sido feitos testes com dados reais, avalie a restauração separadamente.
