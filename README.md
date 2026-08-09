# 🚀 DeployMate

> **“One mobile app to deploy, monitor, debug and fix your applications — across Kubernetes, Vercel and Netlify.”**

DeployMate is a production-grade, mobile-first deployment platform designed for indie developers, small teams, and DevOps engineers.

---

## 📐 End-to-End Workflow & Architecture

```mermaid
flowchart TD
    App["📱 React Native Expo Mobile App"] <-->|HTTPS REST & WebSockets| API["⚡ NestJS API Gateway"]
    API <--> PostgreSQL[(🐘 PostgreSQL + Prisma)]
    API <--> Redis[(🔴 Redis)]
    API -->|Queue Jobs| Queue[BullMQ Queue Engine]
    Queue --> Worker["⚙️ Deployment Worker Service"]
    Worker -->|Kubernetes API| K8s["☸ Kubernetes Cluster"]
    Worker -->|Vercel REST API| Vercel["▲ Vercel"]
    Worker -->|Netlify REST API| Netlify["◆ Netlify"]
    Worker <--> AI["🤖 Self-Hosted Ollama AI Engine"]
    API --> WS[WebSocket Gateway]
    Worker -->|Live Log Stream| WS
    WS -->|Real-Time Terminal| App
```

```text
GitHub ➔ Select Repository ➔ Select Branch ➔ Configure Environment ➔ Choose Platform ➔ Deploy
   ↓
Monitor Logs & Pod Metrics
   ↓
If Failure ➔ Self-Hosted AI Sanitized Diagnosis ➔ AI Proposes Safe Git Diff ➔ User Approves ➔ CI/CD Redeploy
```

---

## 🛠️ Monorepo Structure

```text
deploymate/
├── apps/
│   ├── api/                 # NestJS REST API Gateway & Socket.io WebSockets
│   ├── worker/              # NestJS BullMQ Deployment Worker Engine
│   └── mobile/              # Expo React Native App (Android/iOS/Web)
├── packages/
│   ├── shared/              # Encryption (AES-256-GCM), Secret Redactor, Action Registry
│   ├── types/               # TypeScript interfaces, Provider abstractions, Zod schemas
│   └── config/              # Shared tsconfig & ESLint configurations
├── ai/                      # Self-hosted Ollama AI provider & diagnosis prompts
│   ├── providers/
│   ├── prompts/
│   ├── schemas/
│   └── services/
├── infrastructure/          # Dockerfiles, K8s manifests, Helm charts, Prometheus configs
│   ├── docker/
│   ├── kubernetes/
│   ├── helm/
│   └── monitoring/
├── prisma/                  # PostgreSQL schema & Prisma migrations
│   └── schema.prisma
├── docker-compose.yml       # Local dev environment (Postgres, Redis, API, Worker, Ollama, Prometheus)
├── pnpm-workspace.yaml      # Monorepo configuration
├── .env.example
└── README.md
```

---

## 🛡️ AI Security & Action Registry

DeployMate enforces **Zero Unrestricted Shell/Kubernetes Access**. The self-hosted LLM (Ollama/vLLM) can only suggest structured JSON actions validated against a strict Zod schema and Action Registry:

- `UPDATE_IMAGE`: Update container image tag
- `UPDATE_ENVIRONMENT`: Add/Update application environment variables
- `RESTART_DEPLOYMENT`: Trigger rolling pod restart
- `ROLLBACK`: Revert deployment to target version
- `UPDATE_REPLICAS`: Scale deployment replicas
- `UPDATE_RESOURCES`: Adjust CPU & Memory requests/limits
- `UPDATE_DOCKERFILE`: Propose Git diff patch for Dockerfile
- `UPDATE_DEPENDENCY`: Propose dependency version patch

> [!IMPORTANT]
> All AI proposals generate a unified Git diff and require **Explicit One-Tap Mobile User Approval** before any change is applied.

---

## 🚀 Local Quickstart Guide

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### 1. Install Monorepo Dependencies
```bash
pnpm install
```

### 2. Start Local Infrastructure (PostgreSQL, Redis, Ollama, Prometheus, Grafana)
```bash
docker compose up -d
```

### 3. Initialize Database & Push Prisma Schema
```bash
pnpm db:generate
pnpm db:push
```

### 4. Run Monorepo Services in Development Mode
```bash
# Start API Gateway (http://localhost:3000)
pnpm dev:api

# Start Deployment Worker Process
pnpm dev:worker

# Start Expo Mobile App
pnpm dev:mobile
```

---

## 📊 OpenAPI & Observability Probes

- **OpenAPI / Swagger Specs**: `http://localhost:3000/api/docs`
- **Liveness Probe**: `http://localhost:3000/health`
- **Readiness Probe**: `http://localhost:3000/ready`
- **Prometheus Metrics**: `http://localhost:3000/metrics`
- **Grafana Dashboard**: `http://localhost:3001` (User: `admin`, Pass: `admin`)

---

## 🔒 Environment Variables Reference (`.env.example`)

```text
DATABASE_URL="postgresql://deploymate:deploymate_secret@localhost:5432/deploymate?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="deploymate_super_secret_jwt_access_key_change_in_prod"
JWT_REFRESH_SECRET="deploymate_super_secret_jwt_refresh_key_change_in_prod"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

VERCEL_TOKEN="your_vercel_bearer_token"
NETLIFY_TOKEN="your_netlify_token"

OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
```
