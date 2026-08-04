# Retail Voice of Customer Backend

## Overview
A lightweight backend scaffold for the VoC insight engine.

## Install
```bash
cd backend
npm install
```

## Run
```bash
cd backend
npm run dev
```

## API
- `GET /api/health`
- `POST /api/feedback/ingest` - ingest feedback items
- `GET /api/feedback` - list feedback
- `POST /api/themes/estimate` - estimate themes from items
- `GET /api/themes` - list generated themes

## Feedback item schema
```json
{
  "id": "optional",
  "source": "reviews|social|ticket|survey",
  "origin": "same as source or raw source name",
  "timestamp": "ISO 8601 timestamp",
  "text": "feedback content",
  "rating": 4,
  "product": "SKU-123",
  "store": "store-001",
  "journeyStage": "checkout|delivery|experience",
  "metadata": {}
}
```
