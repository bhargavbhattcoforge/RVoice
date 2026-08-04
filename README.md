# RVoice

This repository contains a Voice of Customer (VoC) platform with separate frontend and backend folders.

## Structure

- `backend/` - Express backend API, ingestion services, theme analysis, action recommendation, and static file serving.
- `frontend/` - Static dashboard UI for loading VoC actions, clusters, and emerging issue spikes.

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:4000` and serves the frontend from the root of the project.

API endpoints:
- `GET /api/health`
- `POST /api/feedback/ingest`
- `POST /api/themes/estimate`
- `GET /api/themes`
- `GET /api/actions`
- `POST /api/actions`
- `PATCH /api/actions/:actionId`
- `GET /api/clusters`
- `GET /api/detection/spikes`
- `GET /api/overview`

### Frontend
The frontend is served automatically by the backend at:

- `http://localhost:4000`

It contains a simple dashboard that loads actions, theme clusters, and spikes from the backend.

## Notes
- Use `npm run test:integration` inside `backend/` to validate backend flows.
- The backend currently stores data in `backend/data/`.
