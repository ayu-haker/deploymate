# 🛡️ DeployMate Monitor

> **“Dedicated 7-Stage DevSecOps Watchdog & Telemetry Companion App for DeployMate & VertexLab Status App.”**

[![Download Android APK](https://img.shields.io/badge/📱_Download_Android_APK-v1.0.0-38bdf8?style=for-the-badge&logo=android)](https://github.com/ayu-haker/deploymate-monitor/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk)
[![GitHub Release](https://img.shields.io/github/v/release/ayu-haker/deploymate-monitor?style=for-the-badge&color=34d399)](https://github.com/ayu-haker/deploymate-monitor/releases/tag/v1.0.0)

DeployMate Monitor is an independent, mobile-first DevSecOps Operations Command Center app designed to monitor, audit, and sync all 7 architecture stages of your deployments in real time.

---

## 📐 7-Stage DevSecOps Architecture Monitored

```text
STEP 1: Containerization ➔ Multi-Stage Dockerfile (Node 20 Alpine, Non-Root UID 10001)
STEP 2: Container Registry ➔ Docker Hub (ayushman21/vertexlab-status-app:v1.0.0 & :latest)
STEP 3: CI Pipeline ➔ GitHub Actions (.github/workflows/ci.yml)
STEP 4: Security Layer ➔ Aqua Security Trivy Vulnerability Audit (0 Critical / 0 High CVEs)
STEP 5: K8s Deployment ➔ Deployment.yaml & Service.yaml (3/3 Pod Replicas)
STEP 6: GitOps Integration ➔ Argo CD (argocd.yaml Automated Sync & Self-Heal)
STEP 7: Monitoring ➔ Prometheus ServiceMonitor Scraper & Grafana Telemetry
```

---

## 🛠️ Features

- 🎛️ **7 Interactive Architecture Buttons**: Tap any stage button for live code snippet & security audit verification details.
- 🛡️ **Instant Trivy Security Audit**: 1-tap CVE vulnerability audit execution.
- 🔄 **ArgoCD GitOps Sync**: 1-tap live cluster self-healing trigger.
- ☸ **Kubernetes Pod Replicas Grid**: Live CPU % and RAM usage for all pod replicas.
- 📈 **Prometheus Telemetry Graph**: Real-time HTTP throughput (req/sec) visualization.
- 📡 **Bash Terminal Window**: Live scrolling DevSecOps log stream.

---

## 🚀 Quickstart & Installation

### Option A: Install Android APK Directly
Download the release APK directly to your Android device:
[📱 Download DeployMate-Monitor-v1.0-release.apk](https://github.com/ayu-haker/deploymate-monitor/releases/download/v1.0.0/DeployMate-Monitor-v1.0-release.apk)

### Option B: Local Development
```bash
# Navigate to monitor directory
cd deploymate-monitor

# Install dependencies
pnpm install

# Start Metro bundler
npx expo start
```
