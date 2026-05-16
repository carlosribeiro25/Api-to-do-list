# DaylyTasks — API To-Do List

REST API para gerenciamento de tarefas pessoais com autenticação JWT, controle de roles e filtros avançados.  
Deploy em produção: **https://daylytasks.fly.dev** · Documentação interativa: **https://daylytasks.fly.dev/docs**

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
    Client["🌐 Cliente HTTP\n(Browser / Mobile / Postman)"]
    SWAGGER["📄 Swagger UI\nGET /docs"]

    Client -->|"Qualquer requisição"| MW_CORS
    Client -->|"GET /docs"| SWAGGER

    subgraph Fastify["⚡ Fastify Application"]

        MW_CORS["🔀 CORS Middleware\norigem permitida: *"]

        subgraph Public["🔓 Rotas Públicas — sem autenticação"]
            R_LOGIN["POST /login\n→ retorna JWT"]
            R_CREATE_USER["POST /users\n→ cadastra usuário"]
        end

        MW_JWT["🔐 JWT Hook\nverify-request-jwt\nvalida Bearer token"]

        subgraph UsersProtected["👤 Rotas de Usuários — JWT + Role: admin"]
            R_GET_USERS["GET /users\n→ lista usuários"]
            R_GET_USER["GET /users/:id\n→ busca por ID"]
            R_UPDATE_USER["PATCH /users/:id\n→ atualiza dados"]
            R_DELETE_USER["DELETE /users/:id\n→ remove usuário"]
        end

        MW_ROLE["🛡️ Role Hook\ncheckRole\nexige role = admin"]

        subgraph TasksProtected["📋 Rotas de Tarefas — JWT obrigatório"]
            R_GET_TASKS["GET /tasks\n→ lista tarefas do usuário"]
            R_GET_TASK["GET /tasks/:id\n→ busca tarefa por ID"]
            R_FILTER["GET /tasks/filter\n→ filtra por category/priority/status/date"]
            R_CREATE_TASK["POST /tasks\n→ cria nova tarefa"]
            R_UPDATE_TASK["PATCH /tasks/:id\n→ atualiza campos da tarefa"]
            R_UPDATE_STATUS["PATCH /tasks/:id/status\n→ atualiza apenas o status"]
            R_DELETE_TASK["DELETE /tasks/:id\n→ remove tarefa"]
        end

    end

    DB[("🗄️ PostgreSQL\nNeon Serverless\n[users] [tasks]")]

    MW_CORS -->|"sem token"| Public
    MW_CORS -->|"com Bearer token"| MW_JWT
    MW_JWT -->|"token válido + role admin"| MW_ROLE
    MW_JWT -->|"token válido"| TasksProtected
    MW_ROLE --> UsersProtected

    Public -->|"SELECT / INSERT"| DB
    UsersProtected -->|"SELECT / UPDATE / DELETE"| DB
    TasksProtected -->|"SELECT / INSERT / UPDATE / DELETE"| DB
```

---

## Banco de Dados

```mermaid
erDiagram
    USERS {
        int       id         PK  "AUTO INCREMENT"
        text      name           "NOT NULL — mínimo 4 chars"
        text      email          "NOT NULL — UNIQUE"
        text      password       "NOT NULL — hash Argon2"
        role_enum role           "admin | user  (default: user)"
        timestamp created_at     "default: now()"
    }

    TASKS {
        int           id          PK  "AUTO INCREMENT"
        text          title           "NOT NULL — mínimo 4 chars"
        text          description     "NULLABLE — mínimo 4 chars (CHECK)"
        priority_enum priority        "alta | media | baixa"
        category_enum category        "estudo | saude | trabalho | pessoal | outro"
        text          date            "NULLABLE — formato DD/MM/YYYY"
        text          time            "NULLABLE — formato HH:MM"
        status_enum   status          "pendente | concluido | em_andamento"
        int           userId      FK  "NOT NULL → USERS.id"
        timestamp     created_at      "default: now()"
    }

    USERS ||--o{ TASKS : "um usuário possui zero ou mais tarefas"
```

---

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor C as 🌐 Cliente
    participant API as ⚡ Fastify API
    participant DB as 🗄️ PostgreSQL
    participant A2 as 🔑 Argon2
    participant JWT as 🎟️ JWT (jsonwebtoken)

    Note over C,JWT: ── Etapa 1: Login ──

    C->>API: POST /login\n{ email: "user@email.com", password: "senha123" }
    API->>DB: SELECT * FROM users WHERE email = 'user@email.com'
    DB-->>API: { id, name, email, password_hash, role }

    API->>A2: argon2.verify(password_hash, "senha123")

    alt ✅ Credenciais válidas
        A2-->>API: true
        API->>JWT: jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
        JWT-->>API: "eyJhbGci..."
        API-->>C: 200 OK\n{ token: "eyJhbGci..." }
    else ❌ Senha incorreta ou usuário não encontrado
        A2-->>API: false / DB retorna vazio
        API-->>C: 400 Bad Request\n{ message: "Credenciais invalidas" }
    end

    Note over C,JWT: ── Etapa 2: Requisição autenticada ──

    C->>API: GET /tasks\nAuthorization: Bearer eyJhbGci...
    API->>JWT: jwt.verify(token, JWT_SECRET)

    alt ✅ Token válido e não expirado
        JWT-->>API: payload { sub: "42", role: "user" }
        API->>DB: SELECT * FROM tasks WHERE userId = 42
        DB-->>API: [ { id, title, status, ... }, ... ]
        API-->>C: 200 OK\n{ tasks: [ {...}, {...} ] }
    else ❌ Token inválido, expirado ou ausente
        JWT-->>API: JsonWebTokenError / TokenExpiredError
        API-->>C: 401 Unauthorized\n{ error: "Autenticacao invalida" }
    end

    Note over C,JWT: ── Etapa 3: Rota com Role Admin ──

    C->>API: GET /users\nAuthorization: Bearer eyJhbGci...
    API->>JWT: jwt.verify(token, JWT_SECRET)
    JWT-->>API: payload { sub: "42", role: "user" }

    alt ✅ role === "admin"
        API->>DB: SELECT * FROM users
        DB-->>API: [ {...}, {...} ]
        API-->>C: 200 OK\n{ users: [ {...} ] }
    else ❌ role !== "admin"
        API-->>C: 403 Forbidden\n{ error: "Acesso negado" }
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
| `GET` | `/tasks` | ✅ JWT | Lista todas as tarefas do usuário autenticado |
| `GET` | `/tasks/:id` | ✅ JWT | Busca tarefa por ID |
| `GET` | `/tasks/filter` | ✅ JWT | Filtra tarefas por query params |
| `PATCH` | `/tasks/:id` | ✅ JWT | Atualiza um ou mais campos da tarefa |
| `PATCH` | `/tasks/:id/status` | ✅ JWT | Atualiza apenas o status da tarefa |
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
