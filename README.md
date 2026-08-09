# 🚀 DeployMate & DeployMate Monitor Monorepo

> **Autonomous SRE Operations Platform & 7-Stage DevSecOps Watchdog Mobile Applications**

[![DeployMate SRE APK](https://img.shields.io/badge/📱_Download_DeployMate_SRE_APK-v1.0.0-6366f1?style=for-the-badge&logo=android)](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-v1.0-release.apk)
[![DeployMate Monitor APK](https://img.shields.io/badge/🛡️_Download_DeployMate_Monitor_APK-v1.0.0-38bdf8?style=for-the-badge&logo=android)](https://github.com/ayu-haker/deploymate-monitor/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk)
[![GitHub Release](https://img.shields.io/github/v/release/ayu-haker/deploymate?style=for-the-badge&color=34d399)](https://github.com/ayu-haker/deploymate/releases/tag/v1.0.0)

---

## 📂 Monorepo Structure

```text
D:\god-project/
├── 🚀 apps/
│   ├── 📱 mobile/                  <-- Main DeployMate SRE Mobile Application
│   ├── 🛡️ deploymate-monitor/      <-- DevSecOps 7-Stage Watchdog Mobile Application
│   ├── 🌐 devsecops-dashboard/     <-- Web Command Center (index.html)
│   ├── ⚙️ api/                     <-- NestJS Backend Service & Telemetry Engine
│   └── ⚡ worker/                  <-- Background SRE Task Worker
├── 📐 k8s/                         <-- Kubernetes Deployment & Service Manifests
├── 🔄 argocd.yaml                  <-- GitOps Automated Sync Manifest
├── 🛡️ .github/workflows/ci.yml    <-- GitHub Actions CI/CD & Trivy Security Gate
├── 🐳 Dockerfile                   <-- Multi-Stage Production Node 20 Alpine Image
├── 📦 app.js                       <-- Express + prom-client Express Application
└── 📄 README.md
```

---

## 📱 Mobile Applications Included

### 1. 🚀 **DeployMate SRE Platform (`apps/mobile`)**
- **Purpose**: Complete SRE mission control, incident remediation, AI fixes, and infrastructure telemetry.
- **Package Name**: `io.deploymate.app`
- **Download**: [DeployMate-v1.0-release.apk](https://github.com/ayu-haker/deploymate/releases/download/v1.0.0/DeployMate-v1.0-release.apk)

### 2. 🛡️ **DeployMate Monitor (`apps/deploymate-monitor`)**
- **Purpose**: Dedicated 7-stage DevSecOps watchdog app monitoring Dockerfile, Docker Hub, GitHub Actions CI, Trivy Security Scans, Kubernetes Pods, ArgoCD GitOps, and Prometheus telemetry.
- **Package Name**: `io.deploymate.monitor`
- **Download**: [DeployMate-Monitor-v1.0-release.apk](https://github.com/ayu-haker/deploymate-monitor/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk)

---

## 📐 7-Stage DevSecOps Architecture

```text
STEP 1: Containerization ➔ Multi-Stage Dockerfile (Node 20 Alpine, Non-Root UID 10001)
STEP 2: Container Registry ➔ Docker Hub (ayushman21/vertexlab-status-app:v1.0.0 & :latest)
STEP 3: CI Pipeline ➔ GitHub Actions (.github/workflows/ci.yml)
STEP 4: Security Layer ➔ Aqua Security Trivy Vulnerability Audit (0 Critical / 0 High CVEs)
STEP 5: K8s Deployment ➔ Deployment.yaml & Service.yaml (3/3 Pod Replicas)
STEP 6: GitOps Integration ➔ Argo CD (argocd.yaml Automated Sync & Self-Heal)
STEP 7: Monitoring ➔ Prometheus ServiceMonitor Scraper & Grafana Telemetry
```
