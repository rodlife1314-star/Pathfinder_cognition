# Deployment Guide for Pathfinder Aperture

This guide outlines deployment procedures for containerized Pathfinder Aperture environments.

---

## 1. Local Sandboxed Setup

For local testing or simulation setups, configure the node using Docker/npm:

```bash
# 1. Clean build assets
npm run build

# 2. Run in Production mode
NODE_ENV=production npm start
```

---

## 2. Google Cloud Platform & Cloud Run (Production)

The production environment is built for optimal, highly secure container ingestion on **GCP Cloud Run**.

### Dockerfile (Sample Specification)
```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Deploying via gcloud CLI

Execute the following commands from the workstation root to compile and push the container to Google Artifact Registry:

```bash
# Set active project
gcloud config set project [YOUR_PROJECT_ID]

# Submit build to Cloud Build
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/pathfinder-aperture:latest

# Deploy to Cloud Run
gcloud run deploy pathfinder-aperture \
  --image gcr.io/[YOUR_PROJECT_ID]/pathfinder-aperture:latest \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY=[SECURE_KEY_HASH]
```

---

## 3. Firebase Firestore Setup

Pathfinder Aperture stores permanent operator acquisitions persistently on Google Firestore. To initialize database parameters:

1.  Enable **Cloud Firestore** inside the GCP / Firebase Console.
2.  Set security rules as specified in `firestore.rules` (this prevents cross-tenant leaks).
3.  Deploy security constraints via CLI:
    ```bash
    firebase deploy --only firestore:rules
    ```

### FireStore Rules Overview
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolated per authenticated operator (userId match validation)
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /substrate_deltas/{deltaId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 4. Port Bounds Constraint

> [!CAUTION]
> The production container ingress reverse-proxy layer routes traffic **exclusively to port 3000**. The Express backend must remain listening on `0.0.0.0:3000` under all deployment scenarios. Avoid modifications to binding host specifications in `server.ts`.
