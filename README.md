# AI-Powered Support Assistant

This repository contains a simple full-stack application that lets users chat with an AI assistant through a web interface. The assistant answers questions using a set of product documentation stored in a JSON file, keeps track of each conversation in SQLite, and maintains context across messages.

The goal is to demonstrate how documentation-based retrieval and an LLM can be combined to build a support chatbot. The front end is built with React, the back end uses Node/Express, and conversation data lives in a SQLite-compatible database.

---

## Repository structure

```
backend/           # Express server, database logic, LLM service
frontend/          # React app (Vite + Tailwind)
```

Each folder has its own `package.json` and can be run independently.

---

## Setup instructions

### Prerequisites

- Node.js 18+ (or equivalent)
- npm or yarn
- A Cohere (or other) API key for the AI part
- Optional: Turso account / SQLite file

### Backend

1. `cd backend`
2. Copy `.env.example` to `.env` and fill in the values:
   ```env
   PORT=5000
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your_token
   COHERE_API_KEY=your_cohere_key
   ```
   *If you prefer a local SQLite file,* replace the `db.js` client with `sqlite3` or `better-sqlite3` and adjust `TURSO_` variables accordingly.
3. Install dependencies: `npm install`
4. Initialize the database tables: `node src/config/initDb.js`
5. Start the server: `npm run dev` (or `node src/index.js`)

The backend will listen on `http://localhost:5000` by default.

### Frontend

1. `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:5173` in the browser. The React app proxies `/api` requests to the backend.

---

## How it works


The `/backend/src/utils/docs.json` file contains an array of FAQ-style entries:

```json
[
  { "title": "Reset Password", "content": "Users can reset password from Settings > Security." },
  { "title": "Refund Policy", "content": "Refunds are allowed within 7 days of purchase." }
]
```

When the user asks a question, the server finds any documents whose title or content appear in the question. If nothing matches, the assistant replies with:

> "Sorry, I don’t have information about that."

Otherwise, it sends the matching documents, the last five message pairs from the session, and the user’s query to the LLM (Cohere in this implementation). The LLM is instructed to answer **only** using the provided documentation.

### Context & memory

Messages are stored in a `messages` table alongside a `sessions` table. Each request to `/api/chat` records the user message and, once generated, the assistant reply. The most recent five pairs (ten messages) are selected for context when querying the LLM.

### Database schema

Tables are created by `src/config/initDb.js`.

**sessions**

| column     | type     | notes                          |
|------------|----------|--------------------------------|
| id         | TEXT     | sessionId (UUID or similar)    |
| created_at | DATETIME | default CURRENT_TIMESTAMP      |
| updated_at | DATETIME | touched on each chat message   |

**messages**

| column     | type    | notes                               |
|------------|---------|-------------------------------------|
| id         | INTEGER | primary key autoincrement          |
| session_id | TEXT    | foreign key to sessions.id         |
| role       | TEXT    | "user" or "assistant"           |
| content    | TEXT    | message body                       |
| created_at | DATETIME| default CURRENT_TIMESTAMP          |

### API endpoints

| Method | Path                     | Description                               |
|--------|--------------------------|-------------------------------------------|
| POST   | `/api/chat`              | Send a user message, receive assistant reply. Must include `sessionId` and `message` in JSON body. Returns `{ reply, tokensUsed }`. |
| GET    | `/api/conversations/:sessionId` | Fetch full message history for a session. | 
| GET    | `/api/sessions`          | List all sessions with last updated timestamp. |

Responses are JSON. Errors are reported with HTTP status codes and an `error` field. Basic rate limiting is enabled (50 requests per 15 minutes per IP).

---

## Assumptions and notes

- The LLM key is stored in `.env` and not committed. The example file lists the required variables.
- The docs search is simple; for production you'd replace it with a proper similarity search or embeddings.
- The frontend and backend are separate projects; the frontend uses a Vite proxy to avoid CORS issues.
- Conversations are kept forever in the database; no cleanup logic is provided.
- There is no authentication – session IDs are random and stored in localStorage.
- The app is not yet dockerized, though the folder structure would support it.
- The Cohere client is used in `llmService.js`; you can swap in another provider if you like.

---

## 📦 Optional improvements

- Add embedding/similarity search for more accurate document retrieval.
- Write unit tests for the backend routes and services.
- Support markdown rendering on the frontend.
- Dockerize both frontend and backend for easier deployment.
- Deploy to any cloud service and update README with a live URL.

Feel free to experiment and build on top of this as a foundation for an AI-driven support chat system.