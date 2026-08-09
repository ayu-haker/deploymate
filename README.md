# 🚀 DeployMate & DeployMate Monitor

<p align="center">
  <img src="https://img.shields.io/badge/Production-Ready-34d399?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Architecture-7--Stage_DevSecOps-38bdf8?style=for-the-badge&logo=docker&logoColor=white" alt="DevSecOps Architecture" />
  <img src="https://img.shields.io/badge/Security-Trivy_Clean_(0_CVE)-10b981?style=for-the-badge&logo=aquasecurity&logoColor=white" alt="Security Clean" />
  <img src="https://img.shields.io/badge/GitOps-Argo_CD_Self--Healing-f97316?style=for-the-badge&logo=argo&logoColor=white" alt="ArgoCD GitOps" />
  <img src="https://img.shields.io/badge/License-MIT_Strict_Protocol-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="MIT Strict License" />
  <img src="https://img.shields.io/badge/Mobile-Android_APK_v1.0.0-6366f1?style=for-the-badge&logo=android&logoColor=white" alt="Android Release" />
</p>

---

## 🌟 Executive Summary

**DeployMate** is an enterprise-grade, autonomous **Site Reliability Engineering (SRE) & DevSecOps Platform** designed to manage end-to-end containerized web application lifecycles, automated security gates, Kubernetes cluster GitOps self-healing, and real-time telemetry monitoring.

The system features **two interconnected mobile applications**:
1. **🚀 DeployMate SRE**: Active SRE Ops, AI Incident Remediation, Infrastructure Control & Automated Rollbacks.
2. **🛡️ DeployMate Monitor**: DevSecOps Watchdog, 7-Stage Architecture Inspector, Trivy CVE Audits & ArgoCD Sync.

---

## 📥 Direct APK Downloads

[![DeployMate SRE APK](https://img.shields.io/badge/📱_Download_DeployMate_SRE_APK-v1.0.0-6366f1?style=for-the-badge&logo=android)](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-v1.0-release.apk)
[![DeployMate Monitor APK](https://img.shields.io/badge/🛡️_Download_DeployMate_Monitor_APK-v1.0.0-38bdf8?style=for-the-badge&logo=android)](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk)

| App Name | Package Name | Primary Role | APK Direct Download Link |
| :--- | :--- | :--- | :--- |
| **🚀 DeployMate SRE** | `io.deploymate.app` | SRE Mission Control & AI Incident Remediation | [📱 Download DeployMate-v1.0-release.apk](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-v1.0-release.apk) |
| **🛡️ DeployMate Monitor** | `io.deploymate.monitor` | 7-Stage DevSecOps Watchdog & Telemetry | [🛡️ Download DeployMate-Monitor-v1.0-release.apk](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk) |

---

## 🔄 Dual-App System Interconnection & Ecosystem Workflow

```mermaid
graph TD
    subgraph "🐳 Kubernetes & CI/CD Pipeline (Target: ayushman21/vertexlab-status-app)"
        A["💻 Developer Commit"] --> B["⚙️ GitHub Actions CI"]
        B --> C["🛡️ Trivy Security Scan Gate"]
        C -- "Clean (0 CVE)" --> D["📦 Docker Hub Registry"]
        D --> E["☸ Kubernetes Cluster (3 Pod Replicas)"]
        E --> F["🔄 Argo CD GitOps Sync"]
        E --> G["📊 Prometheus Telemetry (/metrics)"]
    end

    subgraph "⚙️ Central Control Engine (apps/api & Worker)"
        G --> H["📡 NestJS Telemetry & Event Hub"]
        E --> H
        C --> H
        F --> H
    end

    subgraph "📱 Interconnected Mobile App Layer"
        H <== "Real-time Telemetry & Pod Metrics" ==> I["🚀 DeployMate SRE App (apps/mobile)"]
        H <== "7-Stage Pipeline & Security Status" ==> J["🛡️ DeployMate Monitor (apps/deploymate-monitor)"]
        
        I -- "1-Tap AI Fix & K8s Rollout" --> E
        J -- "1-Tap Instant Trivy Audit & ArgoCD Sync" --> F
        
        I <== "Bi-Directional Event Sync (Incidents & Audits)" ==> J
    end
```

---

## 🔄 1. DeployMate SRE Operational Workflow

```mermaid
sequenceDiagram
    autonumber
    participant K8s as Kubernetes Cluster
    participant Api as NestJS API Engine
    participant SRE as 🚀 DeployMate SRE App
    participant AI as 🧠 AI Remediation Engine
    participant Git as GitHub Repository

    K8s->>Api: High CPU / Memory Crash Loop Alert
    Api->>SRE: Push Real-Time Incident Notification
    SRE->>AI: Trigger "Diagnose & Fix Incident"
    AI-->>SRE: Generate Patch & Root-Cause Fix
    SRE->>Git: Auto-commit Code/Manifest Patch
    SRE->>K8s: Trigger Zero-Downtime Rolling Update
    K8s-->>SRE: Status: 3/3 Replicas Healthy
```

---

## 🛡️ 2. DeployMate Monitor Watchdog Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Dev as DevSecOps Pipeline
    participant Mon as 🛡️ DeployMate Monitor
    participant Trivy as Aqua Security Trivy
    participant Argo as Argo CD GitOps
    participant SRE as 🚀 DeployMate SRE App

    Dev->>Mon: Stage Update (Dockerfile ➔ Registry ➔ K8s)
    Mon->>Trivy: Trigger Instant Vulnerability Audit
    Trivy-->>Mon: Audit Result: 0 Critical / 0 High CVEs
    Mon->>Argo: Trigger Forced GitOps Sync & Self-Heal
    Argo-->>Mon: Cluster State Synced with Git HEAD
    Mon->>SRE: Sync Security Clearance Badge (All 7 Stages Passed)
```

---

## 🛠️ 7-Stage Architecture Specifications

### 1. 🐳 Containerization (`Dockerfile`)
- **Base Image**: Multi-stage `node:20-alpine` (Minimal attack surface, size reduced to 128MB).
- **Security Scoping**: Enforced non-root user execution (`USER appuser` with UID `10001`).
- **Health Checks**: `/health` HTTP endpoint exposed on port `3000`.

### 2. 📦 Container Registry (Docker Hub CLI Commands)
- **Target Repository**: `ayushman21/vertexlab-status-app`
- **Commands**:
  ```bash
  docker build -t ayushman21/vertexlab-status-app:v1.0.0 .
  docker push ayushman21/vertexlab-status-app:v1.0.0
  docker push ayushman21/vertexlab-status-app:latest
  ```

### 3. ⚙️ CI Pipeline (`.github/workflows/ci.yml`)
- Automates container compilation and security audit execution on every `git push` to `main`.
- Integrates Docker Buildx with automated caching.

### 4. 🛡️ Security Layer (Aqua Security Trivy Scanner)
- Scans container image for OS and package vulnerabilities prior to registry push.
- **Security Policy**: Zero tolerance gate (`exit-code: 1` on `CRITICAL` or `HIGH` CVEs).

### 5. ☸ Kubernetes Deployment (`k8s/deployment.yaml` & `k8s/service.yaml`)
- Runs **3 Pod Replicas** with `LivenessProbe` (`/health`) and `ReadinessProbe` (`/ready`).
- Exposes cluster service via `ClusterIP` on port 80 mapping to target container port 3000.

### 6. 🔄 GitOps Integration (`argocd.yaml`)
- Automated synchronization policy with `prune: true` and `selfHeal: true`.
- Ensures cluster state automatically converges to the target Git repository state (`https://github.com/ayu-haker/deploymate.git`).

### 7. 📊 Monitoring (`servicemonitor.yaml` & `grafana-dashboard.json`)
- Prometheus `ServiceMonitor` scraping `/metrics` endpoint powered by `prom-client` every 15 seconds.
- Pre-configured Grafana telemetry dashboard monitoring HTTP request rate, CPU/Memory utilization, and active pod metrics.

---

## 📂 Monorepo Repository Structure

```text
god-project/
├── 🚀 apps/
│   ├── 📱 mobile/                  <-- Main DeployMate SRE Mobile Application (io.deploymate.app)
│   ├── 🛡️ deploymate-monitor/      <-- Standalone DevSecOps Watchdog App (io.deploymate.monitor)
│   ├── 🌐 devsecops-dashboard/     <-- Web Command Center UI (index.html)
│   ├── ⚙️ api/                     <-- NestJS Backend Telemetry API Service
│   └── ⚡ worker/                  <-- SRE Incident Remediation Worker
├── 📐 k8s/
│   ├── deployment.yaml             <-- 3 Replica Kubernetes Deployment
│   └── service.yaml                <-- ClusterIP Service Definition
├── 🔄 argocd.yaml                  <-- Argo CD GitOps Application Manifest
├── 📊 servicemonitor.yaml          <-- Prometheus Operator ServiceMonitor
├── 🛡️ .github/workflows/ci.yml    <-- GitHub Actions DevSecOps Pipeline
├── 🐳 Dockerfile                   <-- Multi-Stage Production Dockerfile
├── 📦 app.js                       <-- Express Application with /metrics & /health
├── 📄 LICENSE                      <-- MIT License & Strict Protocols Annex
└── 📄 README.md                    <-- Consolidated Project Documentation
```

---

## 📄 License & Strict Protocols

This project is licensed under the [MIT License](LICENSE) with a **Strict Security & Deployment Protocols Annex**.

### Strict Protocols Summary:
1. **Zero-Tolerance Vulnerability Gate**: Mandatory Aqua Security Trivy scan blocking any `CRITICAL` or `HIGH` CVEs.
2. **Non-Root Execution**: Strict `UID 10001` container privilege restriction.
3. **GitOps Drift Control**: Mandatory Argo CD automated sync (`prune: true`, `selfHeal: true`).
4. **Telemetry Integrity**: Mandatory Prometheus `/metrics` exposure and Liveness/Readiness probes.

---

<p align="center">
  <b>Built with ❤️ by Ayushman Bosu Roy for Enterprise DevSecOps & SRE Reliability.</b>
</p>
