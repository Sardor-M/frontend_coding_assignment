## Frontend Coding Assignment

- **Understanding the requirements:** ~2 hours
- **Implementation time:** ~10 hours
- **Total estimated time:** ~12 hours
- **AI usage:** Allowed (e.g., ChatGPT)

---

## Features

### Project Management

- Create, update, and delete projects
- Responsive UI with Figma-accurate design

### Chatbot (SSE)

- Real-time chat with the server using Server-Sent Events (SSE)
- Structured responses rendered as HTML
- Markdown support and custom citation UI

### RAG Query

- Receives Markdown-formatted responses via SSE
- Renders Markdown as HTML
- Clickable citations ([#-#]) with the following behavior:
    - Quotes are in the format `{docnum}-{index}`
    - Only `{docnum}` is displayed; duplicates are collapsed
    - Clicking a quote shows all `{docnum}-{index}` for that docnum in an alert
    - Clicking the paragraph before a quote shows all related quotes in an alert

### Technical Stack

- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- Custom BFF (Node.js/Express) for API proxying, SSE, and guardrails
- ESLint, Prettier, and strict type-checking

### API Communication

- Supports both standard HTTP and SSE event streams
- BFF handles all backend communication and safety checks

### Safety & Guardrails

- Local and external (LLM-based) guardrails for query safety
- Rate limiting middleware

---

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Build the frontend

```sh
pnpm run build
```

### 3. Start the BFF server

```sh
cd packages/server
pnpm start
```

### 4. Serve the frontend (for local testing)

```sh
cd packages/web
pnpm run preview
```

### 5. Deploy

- The frontend build output is in `dist/` (see `firebase.json` for Firebase Hosting)
- The BFF server can be deployed separately (Node.js environment)

---

## Notes

- All requirements from the assignment are implemented, including custom BFF logic for safety, SSE, and project management.
- The codebase is modular and ready for extension.
- AI tools were used to assist with coding and debugging.
