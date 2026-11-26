# Mecanismos de segurança do projeto

| Mecanismo | Explicação | Arquivo responsável |
|---|---|---|
| **Validação de dados** | Verifica se os dados informados são válidos antes de salvá-los. | `src/validators/compromisso.validator.js` |
| **Prevenção de NoSQL Injection** | Reduz o risco de manipulação maliciosa das consultas ao MongoDB. | `src/models/compromisso.model.js` |
| **Proteção de credenciais** | Mantém as credenciais do banco de dados fora do código-fonte. | `.env`, `.gitignore` e `src/config/env.js` |
| **Proteção contra Mass Assignment** | Permite alterar somente os campos autorizados pelo sistema. | `src/services/compromisso.service.js` |
| **Limitação do tamanho das requisições** | Limita o tamanho dos dados recebidos a 128 KB. | `src/app.js` |
| **Tratamento de erros** | Evita apresentar informações internas do servidor ao usuário. | `src/middlewares/error.middleware.js` |
| **Ocultação da tecnologia** | Remove o cabeçalho HTTP que identifica o Express. | `src/app.js` |
| **Testes automatizados** | Verificam o funcionamento das validações e operações do sistema. | `tests/` |
| **Auditoria de dependências** | Verifica vulnerabilidades conhecidas nas bibliotecas utilizadas. | `package.json` e `package-lock.json`, por meio do npm. |

## Resultados obtidos

| Indicador | Resultado |
|---|---|
| Testes automatizados | 14 aprovados |
| Falhas nos testes | 0 |
| Pacotes auditados | 79 |
| Vulnerabilidades detectadas pelo npm | 0 |

## Melhorias futuras

| Mecanismo | Finalidade |
|---|---|
| Autenticação | Identificar usuários por login e senha. |
| Autorização | Controlar as permissões dos usuários. |
| Rate Limiting | Limitar a quantidade de requisições. |
| Helmet | Adicionar cabeçalhos HTTP de segurança. |
| HTTPS | Criptografar a comunicação com o servidor. |

**Observação:** a arquitetura MVC facilita a organização e manutenção desses mecanismos, mas não constitui, isoladamente, uma proteção de segurança. Os arquivos indicados correspondem à versão refatorada anteriormente, e os resultados são referentes aos testes e à auditoria executados no terminal, não a uma auditoria completa de segurança.
