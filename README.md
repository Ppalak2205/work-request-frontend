# Work Request Tracker — Frontend

React 18 + Vite single-page app for viewing, creating and updating work requests.

## Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The dev server forwards `/api` requests to the backend at `http://localhost:5207` (see `vite.config.js`), so start the backend first.

## Build

```bash
npm run build
```

Output goes to `dist/`. The build calls the API through relative `/api` URLs, so it must be served from the same origin as the API or behind a reverse proxy that forwards `/api`.

## Structure

- `src/api/workRequestsApi.js` — every HTTP call, plus mapping of server validation errors to form fields
- `src/pages/WorkRequestsPage.jsx` — the main page: list, filters, pagination and dialogs
- `src/components/` — table, search/status filter, create form and notes drawer

Database, API and admin account setup are described in the main project README.
