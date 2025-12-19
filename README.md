# Autenticação Profissional com Fastify + JWT + Redis (Docker)

Este projeto é uma API para autenticação de profissionais, desenvolvida como parte da atividade prática da disciplina de Programação Web. O objetivo é implementar um fluxo completo de autenticação utilizando **Fastify**, **JWT** e **Redis** (via Docker) para gerenciar sessões com TTL.

## Objetivo da Atividade

O sistema deve implementar um fluxo de autenticação que inclua:

- Login com **Access Token** (curta duração).
- **Refresh Token** (longa duração).
- Armazenamento de **Access Token** no Redis com TTL.
- Validação da sessão em rotas protegidas.
- Implementação de **Logout**.
- Tratamento de erros e boas práticas.

## Funcionalidades

A API é capaz de:

1. **Gerar tokens**:
   - Geração de Access Token (válido por 30 segundos).
   - Geração de Refresh Token (válido por 10 minutos).

2. **Armazenar sessão no Redis**:
   - O Access Token é armazenado no Redis com um TTL de 30 segundos.

3. **Validar token e sessão**:
   - As rotas protegidas verificam a validade do Access Token e se ele ainda está ativo no Redis.

4. **Renovar sessão via Refresh Token**:
   - Um novo Access Token pode ser gerado utilizando o Refresh Token.

5. **Invalidar sessão manualmente (Logout)**:
   - O token armazenado no Redis é removido, invalidando a sessão.

## Tecnologias Utilizadas

- **Fastify**: Framework backend para construção de APIs rápidas e eficientes.
- **JWT (JSON Web Token)**: Para autenticação e geração de tokens.
- **Redis**: Utilizado como cache para armazenar sessões com TTL.
- **Docker**: Para gerenciar o Redis em um contêiner.

## Endpoints da API

### 1. **POST /auth/login**
- **Descrição**: Realiza o login do profissional e retorna o Access Token e o Refresh Token.
- **Requisição**:
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "email": "aluno@ifpi.edu.br",
      "password": "123456"
    }
    ```
- **Resposta**:
  - **200 OK**:
    ```json
    {
      "accessToken": "string",
      "refreshToken": "string"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "error": "Credenciais inválidas"
    }
    ```

---

### 2. **GET /auth/protected**
- **Descrição**: Rota protegida que valida o Access Token e a sessão no Redis.
- **Requisição**:
  - **Headers**:
    - `Authorization: Bearer <accessToken>`
- **Resposta**:
  - **200 OK**:
    ```json
    {
      "message": "Acesso autorizado",
      "user": {
        "id": 1,
        "email": "aluno@ifpi.edu.br"
      }
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "error": "Token inválido ou expirado"
    }
    ```

---

### 3. **POST /auth/refresh**
- **Descrição**: Gera um novo Access Token utilizando o Refresh Token.
- **Requisição**:
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "refreshToken": "string"
    }
    ```
- **Resposta**:
  - **200 OK**:
    ```json
    {
      "accessToken": "string"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "error": "Refresh token inválido"
    }
    ```

---

### 4. **POST /auth/logout**
- **Descrição**: Invalida a sessão do usuário removendo o Access Token do Redis.
- **Requisição**:
  - **Headers**:
    - `Authorization: Bearer <accessToken>`
- **Resposta**:
  - **200 OK**:
    ```json
    {
      "message": "Logout realizado com sucesso"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "error": "Token inválido ou expirado"
    }
    ```

---

## Configuração do Ambiente

### Pré-requisitos

- **Node.js** (v14 ou superior)
- **Docker** (para rodar o Redis)
- **Redis CLI** (opcional, para verificar o estado do Redis)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/igordev23/ATIVIDADE-PRATICA-Autenticacao-Profissional-com-Fastify
   cd Fluxo_de_autenticacao
## Instalação

### 2. Instale as dependências:

```bash
npm install
```

### Configure o Redis com Docker:

```bash
docker run --name redis -p 6379:6379 -d redis
```

### Inicie o servidor:

```bash
npm run dev
```

### Acesse a API em: 
http://localhost:3000.

---

## Estrutura do Projeto

```plaintext
src/
├── controllers/
│   └── authController.ts    # Lógica dos endpoints de autenticação
├── db/
│   └── clienteRedis.ts      # Configuração do cliente Redis
├── middleware/
│   └── authMiddleware.ts    # Middleware para validação de autenticação
├── routes/
│   └── authRoutes.ts        # Definição das rotas de autenticação
├── services/
│   └── tokenServices.ts     # Serviços de geração e validação de tokens
├── users.json               # Base de dados simulada de usuários
└── server.ts                # Configuração e inicialização do servidor
```

---

## Testando a API com Postman

### Login:

- **Método**: POST  
- **URL**: http://localhost:3000/auth/login  
- **Body**:

```json
{
  "email": "aluno@ifpi.edu.br",
  "password": "123456"
}
```

---

### Acessar rota protegida:

- **Método**: GET  
- **URL**: http://localhost:3000/auth/protected  
- **Headers**:  
  - Authorization: Bearer `<accessToken>`

---

### Renovar sessão:

- **Método**: POST  
- **URL**: http://localhost:3000/auth/refresh  
- **Body**:

```json
{
  "refreshToken": "<refreshToken>"
}
```

---

### Logout:

- **Método**: POST  
- **URL**: http://localhost:3000/auth/logout  
- **Headers**:  
  - Authorization: Bearer `<accessToken>`

---

## Boas Práticas Implementadas

- **Validação de erros**: Todas as rotas retornam mensagens claras para erros de autenticação.  
- **Segurança**: Tokens JWT são usados para autenticação e sessões são armazenadas no Redis com TTL.  
- **Modularidade**: Código organizado em controladores, serviços, middlewares e rotas.  
