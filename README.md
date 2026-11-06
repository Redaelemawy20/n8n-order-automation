# n8n-order-automation

n8n lab: Telegram orders → Next.js API + SQLite, workflows as code.
- **Run:** `npm install && npm run dev` → orders page at http://localhost:3000/orders, API at `POST /api/orders` with `{ "item_name", "quantity" }`.
- **Workflows:** TypeScript files in `workflows/` synced with [n8n-as-code](https://n8nascode.dev) using `npx n8nac pull <id>` and `npx n8nac push <file> --draft`.
