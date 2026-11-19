# Agenda de compromissos — JavaScript + MongoDB

Projeto acadêmico com Node.js, Express e banco orientado a documentos MongoDB. Interface web responsiva, sem framework de front-end.

## Pré-requisitos

- Node.js 20.19 ou superior e npm
- MongoDB local **ou** MongoDB Atlas acessível pela rede

## Como executar

1. Descompacte o projeto.
2. Abra um terminal na pasta `agenda-mongodb`.
3. Execute `npm install`.
4. Copie `.env.example` para `.env`.
5. Abra `.env` e ajuste `MONGODB_URI`, `DB_NAME` (opcional) e `PORT` (opcional).
6. Execute `npm start`.
7. Acesse **http://localhost:3000** no navegador.

### Exemplo de conexão local

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=agenda_compromissos
PORT=3000
```

### Exemplo de MongoDB Atlas

```dotenv
MONGODB_URI=mongodb+srv://USUARIO:SENHA@SEU-CLUSTER.mongodb.net/?retryWrites=true&w=majority
DB_NAME=agenda_compromissos
PORT=3000
```

Troque os marcadores pelos seus dados. Para o Atlas, configure usuário de banco e acesso de rede no painel do Atlas. Caracteres especiais em usuário/senha precisam ser codificados corretamente na URI. **Não publique o arquivo `.env` nem suas credenciais.**

O banco e a coleção `compromissos` serão criados pelo MongoDB na primeira gravação. O índice de data é criado no início do servidor.

## Requisitos da atividade atendidos

| Requisito | Implementação |
| --- | --- |
| Data/horário | `dataHorario` (Date do MongoDB) |
| Título | `titulo` (String) |
| Descrição | `descricao` (String) |
| Pessoas individualizadas | `pessoas` (array de objetos `{id: ObjectId, nome: String}`) |
| Listar compromissos | Tela inicial + GET |
| Cadastrar | Botão “Novo compromisso” + POST |
| Alterar título e descrição | Botão “Editar” + PATCH |
| Alterar pessoas | Botão “Pessoas” / editor + PUT |
| Excluir uma pessoa | × no chip da pessoa + DELETE |
| Excluir compromisso | Botão “Excluir” + DELETE |

## Exemplo de documento MongoDB

```json
{
  "_id": "ObjectId('...')",
  "dataHorario": "ISODate('2026-11-25T17:30:00.000Z')",
  "titulo": "Reunião de projeto",
  "descricao": "Apresentar as etapas do trabalho",
  "pessoas": [
    { "id": "ObjectId('...')", "nome": "Ana" },
    { "id": "ObjectId('...')", "nome": "Bruno" }
  ],
  "criadoEm": "ISODate('...')",
  "atualizadoEm": "ISODate('...')"
}
```

No banco os valores `ObjectId` e `Date` são tipos BSON reais; o bloco acima é apenas uma representação didática.

## API REST

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/compromissos` | Lista todos (até 1000, ordenados por data) |
| POST | `/api/compromissos` | Cria compromisso |
| PATCH | `/api/compromissos/:id` | Altera data, título e/ou descrição |
| PUT | `/api/compromissos/:id/pessoas` | Substitui a lista de pessoas |
| DELETE | `/api/compromissos/:id/pessoas/:pessoaId` | Remove somente uma pessoa |
| DELETE | `/api/compromissos/:id` | Exclui compromisso |
| GET | `/api/saude` | Verifica se servidor está ativo |

POST usa campos `dataHorario` (ISO UTC), `titulo`, `descricao` e `pessoas` (array de objetos `{nome}`). PATCH aceita qualquer subconjunto de `dataHorario`, `titulo` e `descricao`. PUT usa `{ "pessoas": [{"nome":"Ana"}] }`.

## Testes

Execute `npm test` para testes automáticos de validação e identificação individual das pessoas. Eles não dependem de conexão ao MongoDB. Para testar a aplicação de ponta a ponta, configure um MongoDB de teste e cadastre, edite e exclua compromissos na interface.

## Observações de desenvolvimento

- Data/hora é convertida do fuso horário do navegador para UTC antes de armazenar e é exibida de volta no fuso do navegador.
- A substituição da lista de pessoas via PUT gera identificadores novos; remover uma pessoa pelo × usa o identificador existente antes de qualquer salvamento.
- O sistema foi projetado para execução local/acadêmica. Antes de publicar na internet, implemente autenticação, autorização, controle de acesso, HTTPS, proteção contra abuso e backup.
- A listagem está limitada aos primeiros 1000 compromissos; adicionar paginação é recomendável para volumes maiores.
