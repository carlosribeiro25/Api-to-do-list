# DaylyTasks — API To-Do List

REST API para gerenciamento de tarefas pessoais com autenticação JWT, controle de roles e filtros avançados.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Endpoints](#endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar](#como-rodar)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes](#testes)

---

## Visão Geral

API RESTful construída com **Fastify** e **TypeScript** que permite:

- Cadastro e autenticação de usuários com hashing de senha via **Argon2**
- Criação, leitura, atualização e remoção de tarefas
- Filtragem de tarefas por categoria, prioridade, status e data
- Controle de acesso por roles (`admin` / `user`) via **JWT**
- Documentação automática via **Swagger UI** em `/docs`

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js v22 |
| Framework | Fastify 5 |
| Linguagem | TypeScript 6 |
| ORM | Drizzle ORM |
| Banco de Dados | PostgreSQL (Neon serverless) |
| Autenticação | JWT + Argon2 |
| Validação | Zod |
| Testes | Vitest + Supertest |
| Deploy | Fly.io |

---

## Arquitetura

```mermaid
graph TD
    Client["Cliente (HTTP)"]

    subgraph Fastify App
        MW_CORS["CORS Middleware"]
        MW_JWT["JWT Hook\n(verify-request-jwt)"]
        MW_ROLE["Role Hook\n(checkRole)"]

        subgraph Rotas Públicas
            R_LOGIN["POST /login"]
            R_CREATE_USER["POST /users"]
        end

        subgraph Rotas Protegidas - Usuários
            R_GET_USERS["GET /users"]
            R_GET_USER["GET /users/:id"]
            R_UPDATE_USER["PATCH /users/:id"]
            R_DELETE_USER["DELETE /users/:id"]
        end

        subgraph Rotas Protegidas - Tarefas
            R_GET_TASKS["GET /tasks"]
            R_GET_TASK["GET /tasks/:id"]
            R_FILTER["GET /tasks/filter"]
            R_CREATE_TASK["POST /tasks"]
            R_UPDATE_TASK["PATCH /tasks/:id"]
            R_DELETE_TASK["DELETE /tasks/:id"]
        end

        SWAGGER["Swagger UI\n/docs"]
    end

    DB[("PostgreSQL\nNeon")]

    Client --> MW_CORS
    MW_CORS --> R_LOGIN
    MW_CORS --> R_CREATE_USER
    MW_CORS --> MW_JWT
    MW_JWT --> MW_ROLE
    MW_ROLE --> R_GET_USERS
    MW_ROLE --> R_GET_USER
    MW_ROLE --> R_UPDATE_USER
    MW_ROLE --> R_DELETE_USER
    MW_JWT --> R_GET_TASKS
    MW_JWT --> R_GET_TASK
    MW_JWT --> R_FILTER
    MW_JWT --> R_CREATE_TASK
    MW_JWT --> R_UPDATE_TASK
    MW_JWT --> R_DELETE_TASK
    Client --> SWAGGER

    R_LOGIN --> DB
    R_CREATE_USER --> DB
    R_GET_USERS --> DB
    R_GET_USER --> DB
    R_UPDATE_USER --> DB
    R_DELETE_USER --> DB
    R_GET_TASKS --> DB
    R_GET_TASK --> DB
    R_FILTER --> DB
    R_CREATE_TASK --> DB
    R_UPDATE_TASK --> DB
    R_DELETE_TASK --> DB
```

---

## Banco de Dados

```mermaid
erDiagram
    USERS {
        int id PK "gerado automaticamente"
        text name "min 4 chars"
        text email "unique"
        text password "hash argon2"
        role_enum role "admin | user (default: user)"
        timestamp created_at
    }

    TASKS {
        int id PK "gerado automaticamente"
        text title "min 4 chars"
        text description "nullable, min 4 chars"
        priority_enum priority "alta | media | baixa"
        category_enum category "estudo | saude | trabalho | pessoal | outro"
        text date "nullable"
        text time "nullable"
        status_enum status "pendente | concluido | em_andamento"
        int userId FK
        timestamp created_at
    }

    USERS ||--o{ TASKS : "possui"
```

---

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor C as Cliente
    participant API as Fastify API
    participant DB as PostgreSQL
    participant JWT as JWT (jsonwebtoken)

    C->>API: POST /login { email, password }
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: Registro do usuário
    API->>API: argon2.verify(hash, password)
    alt Credenciais válidas
        API->>JWT: jwt.sign({ sub: user.id, role })
        JWT-->>API: token
        API-->>C: 200 { token }
    else Credenciais inválidas
        API-->>C: 400 { message: "Credenciais invalidas" }
    end

    Note over C,API: Requisições protegidas

    C->>API: GET /tasks\nAuthorization: Bearer <token>
    API->>JWT: jwt.verify(token, JWT_SECRET)
    alt Token válido
        JWT-->>API: payload { sub, role }
        API->>DB: SELECT * FROM tasks
        DB-->>API: lista de tarefas
        API-->>C: 200 { tasks: [...] }
    else Token inválido / ausente
        API-->>C: 401 Não autorizado
    end
```

---

## Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/login` | ❌ | Autentica usuário e retorna JWT |

### Usuários

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/users` | ❌ | Cadastra novo usuário |
| `GET` | `/users` | ✅ JWT | Lista todos os usuários |
| `GET` | `/users/:id` | ✅ JWT | Busca usuário por ID |
| `PATCH` | `/users/:id` | ✅ JWT | Atualiza usuário por ID |
| `DELETE` | `/users/:id` | ✅ JWT | Remove usuário por ID |

### Tarefas

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/tasks` | ✅ JWT | Cria nova tarefa |
| `GET` | `/tasks` | ✅ JWT | Lista todas as tarefas |
| `GET` | `/tasks/:id` | ✅ JWT | Busca tarefa por ID |
| `GET` | `/tasks/filter` | ✅ JWT | Filtra tarefas por query params |
| `PATCH` | `/tasks/:id` | ✅ JWT | Atualiza tarefa por ID |
| `DELETE` | `/tasks/:id` | ✅ JWT | Remove tarefa por ID |

#### Query params de `/tasks/filter`

| Parâmetro | Tipo | Valores aceitos |
|---|---|---|
| `category` | string | `estudo` \| `saude` \| `trabalho` \| `pessoal` \| `outro` |
| `priority` | string | `alta` \| `media` \| `baixa` |
| `status` | string | `pendente` \| `concluido` \| `em_andamento` |
| `date` | string | formato livre (ex: `2026-05-15`) |

---

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta `Backend/`:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco
JWT_SECRET=seu_segredo_aqui
PORT=3000
```

---

## Como Rodar

### Pré-requisitos

- Node.js 22+
- Banco PostgreSQL acessível (ex: [Neon](https://neon.tech))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/carlosribeiro25/Api-to-do-list.git
cd Api-to-do-list/Backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com suas credenciais

# Execute as migrations
npm run db:migrate

# (Opcional) Popule o banco com dados de seed
npm run db:seed

# Inicie o servidor em modo desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3000`.  
A documentação Swagger estará em `http://localhost:3000/docs`.

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento com hot reload (`tsx watch`) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Inicia a build compilada |
| `npm run db:generate` | Gera arquivos de migration com Drizzle Kit |
| `npm run db:migrate` | Executa as migrations no banco |
| `npm run db:studio` | Abre o Drizzle Studio (GUI do banco) |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run test` | Executa a suíte de testes com Vitest |

---

## Testes

Os testes utilizam **Vitest** + **Supertest** e cobrem os principais fluxos das rotas de tarefas:

```mermaid
mindmap
  root((Testes))
    Tarefas
      create-task.test.ts
        Cria tarefa com sucesso
        Rejeita dados inválidos
      get-tasks.test.ts
        Lista todas as tarefas
        Retorna 404 se vazio
      get-taskId.test.ts
        Busca por ID existente
        Retorna 404 para ID inexistente
      update-task.test.ts
        Atualiza tarefa existente
        Retorna 404 para ID inexistente
      delete-task.test.ts
        Remove tarefa existente
        Retorna 404 para ID inexistente
```

```bash
npm run test
```
