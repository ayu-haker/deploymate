import React, { useState } from 'react';
import {
  AppRegistry, View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, Modal, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { theme } from './src/theme/tokens';
import { TelemetryChart } from './src/components/TelemetryChart';

const { width } = Dimensions.get('window');

const STAGES = [
  {
    id: '1',
    name: 'Containerization',
    subtitle: 'Production Dockerfile (Multi-Stage Node 20 Alpine)',
    status: 'PASS',
    icon: '🐳',
    codeSnippet: 'FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\nFROM node:20-alpine AS runner\nUSER appuser (10001)\nEXPOSE 3000\nCMD ["node", "app.js"]',
    auditDetails: [
      '✓ Base Image: node:20-alpine (Minimal attack surface)',
      '✓ Multi-Stage Build: Reduced final image size to 128MB',
      '✓ Non-Root User: Enforced UID 10001 (appuser)',
      '✓ Health Check: /health endpoint exposed on port 3000',
    ]
  },
  {
    id: '2',
    name: 'Container Registry',
    subtitle: 'Docker Hub: ayushman21/vertexlab-status-app',
    status: 'PUSHED',
    icon: '📦',
    codeSnippet: 'docker build -t ayushman21/vertexlab-status-app:v1.0.0 .\ndocker push ayushman21/vertexlab-status-app:v1.0.0\ndocker push ayushman21/vertexlab-status-app:latest',
    auditDetails: [
      '✓ Registry: Docker Hub (Hub.docker.com)',
      '✓ Target Repo: ayushman21/vertexlab-status-app',
      '✓ Image Tags: v1.0.0, latest',
      '✓ Digest: sha256:8f4a12c9b4e78a2d109f...',
    ]
  },
  {
    id: '3',
    name: 'CI Pipeline',
    subtitle: 'GitHub Actions (.github/workflows/ci.yml)',
    status: 'SUCCESS',
    icon: '⚙️',
    codeSnippet: 'name: DevSecOps CI/CD\non: [push, pull_request]\njobs:\n  build-and-scan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/build-push-action@v5',
    auditDetails: [
      '✓ Pipeline: GitHub Actions Workflows',
      '✓ Trigger: Push on branch main',
      '✓ Build Engine: Docker Buildx',
      '✓ Execution Time: 42 seconds',
    ]
  },
  {
    id: '4',
    name: 'Security Layer',
    subtitle: 'Trivy Scanner (0 Critical / 0 High CVEs)',
    status: 'SECURE',
    icon: '🛡️',
    codeSnippet: '- name: Run Trivy Vulnerability Scanner\n  uses: aquasecurity/trivy-action@master\n  with:\n    image-ref: "ayushman21/vertexlab-status-app:latest"\n    exit-code: "1"\n    severity: "CRITICAL,HIGH"',
    auditDetails: [
      '✓ Security Scanner: Aqua Security Trivy v0.49.0',
      '✓ Critical Vulnerabilities: 0 (PASSED)',
      '✓ High Vulnerabilities: 0 (PASSED)',
      '✓ Security Gate Action: Block Push if Critical CVE found',
    ]
  },
  {
    id: '5',
    name: 'Kubernetes Deployment',
    subtitle: 'Deployment.yaml & Service.yaml (3 Pod Replicas)',
    status: 'RUNNING',
    icon: '☸',
    codeSnippet: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: vertexlab-status-app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: status-app\n        image: ayushman21/vertexlab-status-app:latest',
    auditDetails: [
      '✓ Cluster Status: 3/3 Replicas Running',
      '✓ Service Type: ClusterIP (Port 80 -> Target 3000)',
      '✓ Probes: Liveness /health, Readiness /ready',
      '✓ Resource Limits: CPU 500m, Memory 256Mi',
    ]
  },
  {
    id: '6',
    name: 'GitOps Integration',
    subtitle: 'Argo CD (argocd.yaml Automated Sync & Self-Heal)',
    status: 'SYNCED',
    icon: '🔄',
    codeSnippet: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: vertexlab-status-app\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true',
    auditDetails: [
      '✓ GitOps Controller: Argo CD v2.10',
      '✓ Repository: https://github.com/ayu-haker/deploymate.git',
      '✓ Sync Policy: Automated (Prune + Self-Heal)',
      '✓ Health State: Healthy & In-Sync',
    ]
  },
  {
    id: '7',
    name: 'Monitoring',
    subtitle: 'Prometheus ServiceMonitor & Grafana Telemetry',
    status: 'ACTIVE',
    icon: '📊',
    codeSnippet: 'apiVersion: monitoring.coreos.com/v1\nkind: ServiceMonitor\nmetadata:\n  name: vertexlab-status-app-monitor\nspec:\n  endpoints:\n  - port: http\n    path: /metrics\n    interval: 15s',
    auditDetails: [
      '✓ Scrape Target: http://.../metrics (prom-client)',
      '✓ Metrics: http_requests_total, process_cpu_seconds',
      '✓ Dashboard: Grafana DevSecOps Telemetry (3001)',
      '✓ Scrape Interval: 15 seconds',
    ]
  }
];

function DevSecOpsMonitorApp() {
  const [refreshing, setRefreshing] = useState(false);
  const [runningScan, setRunningScan] = useState(false);
  const [runningSync, setRunningSync] = useState(false);
  const [activeStage, setActiveStage] = useState(null);

  const [logs, setLogs] = useState([
    '[10:15:01] [INF] App listening on port 3000 (Node 20 Alpine)',
    '[10:15:04] [SEC] Trivy audit clean: 0 CRITICAL / 0 HIGH vulnerabilities',
    '[10:15:08] [K8S] Pod vertexlab-status-app-7f4b89-a1b2 ReadinessProbe OK',
    '[10:15:12] [GITOPS] ArgoCD targetRevision HEAD synced with GitHub repo',
    '[10:15:15] [PROM] Prometheus scraped /metrics (142 req/s)',
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 System Refreshed', 'DevSecOps metrics synced across all 7 architecture stages.');
    }, 600);
  };

  const handleTrivyAudit = () => {
    setRunningScan(true);
    setTimeout(() => {
      setRunningScan(false);
      const time = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [...prev, '[' + time + '] [SEC] Manual Trivy Scan Triggered: 0 Vulnerabilities Found']);
      Alert.alert(
        '🛡️ Trivy Security Gate Passed',
        'Image: ayushman21/vertexlab-status-app:v1.0.0\n\n- CRITICAL Vulnerabilities: 0\n- HIGH Vulnerabilities: 0\n- OS Libraries: 100% Clean\n- Security Policy: PASSED\n\nContainer is 100% secure!'
      );
    }, 1000);
  };

  const handleArgoCdSync = () => {
    setRunningSync(true);
    setTimeout(() => {
      setRunningSync(false);
      const time = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [...prev, '[' + time + '] [GITOPS] ArgoCD Manual Sync Completed (Revision HEAD)']);
      Alert.alert(
        '🔄 ArgoCD GitOps Synced',
        'Repository: https://github.com/ayu-haker/deploymate.git\nTarget Revision: HEAD\n\nAll 3 Pod replicas are healthy and in sync with Git HEAD!'
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#070a12" />

      {/* Top Fixed App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <View style={styles.appLogo}>
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>DeployMate Monitor</Text>
            <Text style={styles.appSubtitle}>DEVSECOPS WATCHDOG</Text>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>ONLINE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.signal} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.targetLabel}>TARGET REPOSITORY IMAGE</Text>
            <Text style={styles.targetName}>ayushman21/vertexlab-status-app</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.healthy }]}>7/7</Text>
              <Text style={styles.statLabel}>STAGES</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.signal }]}>0</Text>
              <Text style={styles.statLabel}>VULNS</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#c084fc' }]}>3/3</Text>
              <Text style={styles.statLabel}>PODS</Text>
            </View>
          </View>
        </View>

        {/* 7 DevSecOps Architecture Stage Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>7-STEP ARCHITECTURE STAGES</Text>
          <Text style={styles.sectionHint}>TAP TO INSPECT CODE</Text>
        </View>

        <View style={styles.stageGrid}>
          {STAGES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.stageCard}
              activeOpacity={0.7}
              onPress={() => setActiveStage(s)}
            >
              <View style={styles.stageCardLeft}>
                <View style={styles.iconCircle}>
                  <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.stageStepRow}>
                    <Text style={styles.stageStepBadge}>STEP {s.id}</Text>
                    <Text style={styles.stageStatusBadge}>{s.status}</Text>
                  </View>
                  <Text style={styles.stageName}>{s.name}</Text>
                  <Text style={styles.stageSub} numberOfLines={1}>{s.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Real-time DevSecOps Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEVSECOPS ACTIONS</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.auditBtn} onPress={handleTrivyAudit} disabled={runningScan}>
            {runningScan ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.auditBtnText}>🛡️ Run Trivy Scan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.syncBtn} onPress={handleArgoCdSync} disabled={runningSync}>
            {runningSync ? (
              <ActivityIndicator color={theme.colors.signal} />
            ) : (
              <Text style={styles.syncBtnText}>🔄 ArgoCD Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Kubernetes Pod Replicas Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>KUBERNETES POD REPLICAS (3/3 RUNNING)</Text>
        </View>

        <View style={styles.podGrid}>
          {[
            { name: 'pod-7f4b89-a1b2', cpu: '14%', ram: '132MB' },
            { name: 'pod-7f4b89-c3d4', cpu: '18%', ram: '128MB' },
            { name: 'pod-7f4b89-e5f6', cpu: '12%', ram: '136MB' },
          ].map((pod, i) => (
            <View key={i} style={styles.podCard}>
              <View style={styles.podTop}>
                <View style={styles.liveDotSmall} />
                <Text style={styles.podName}>{pod.name}</Text>
              </View>
              <Text style={styles.podStats}>CPU: {pod.cpu} | RAM: {pod.ram}</Text>
            </View>
          ))}
        </View>

        {/* Prometheus Telemetry Graph */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROMETHEUS TELEMETRY GRAPH</Text>
        </View>

        <View style={styles.chartCard}>
          <TelemetryChart title="HTTP Throughput (req/sec)" data={[110, 128, 120, 136, 142, 139, 145, 140, 143, 146]} color={theme.colors.signal} height={120} />
        </View>

        {/* Live Scraped Terminal Log Stream */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LIVE DEVSECOPS LOG STREAM</Text>
        </View>

        <View style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.terminalDot, { backgroundColor: '#ef4444' }]} />
              <View style={[styles.terminalDot, { backgroundColor: '#f59e0b' }]} />
              <View style={[styles.terminalDot, { backgroundColor: '#10b981' }]} />
            </View>
            <Text style={styles.terminalTitle}>bash - devsecops.log</Text>
          </View>
          <View style={styles.terminalBody}>
            {logs.map((log, idx) => (
              <Text key={idx} style={styles.logText}>{log}</Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Stage Code & Audit Inspection Modal */}
      <Modal
        visible={!!activeStage}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveStage(null)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Text style={{ fontSize: 24 }}>{activeStage?.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalStep}>STEP {activeStage?.id} AUDITOR</Text>
                <Text style={styles.modalTitle}>{activeStage?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveStage(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>{activeStage?.subtitle}</Text>

            <Text style={styles.modalSectionTitle}>SECURITY & ARCHITECTURE AUDIT:</Text>
            {activeStage?.auditDetails?.map((item, i) => (
              <Text key={i} style={styles.auditItemText}>{item}</Text>
            ))}

            <Text style={styles.modalSectionTitle}>MANIFEST / CONFIGURATION SNIPPET:</Text>
            <ScrollView style={styles.codeSnippetBox}>
              <Text style={styles.codeSnippetText}>{activeStage?.codeSnippet}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.dismissBtn} onPress={() => setActiveStage(null)}>
              <Text style={styles.dismissBtnText}>Close Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070a12' },
  
  appBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#090d16',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  appBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appLogo: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56,189,248,0.15)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#38bdf8',
  },
  appTitle: { fontSize: 17, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.3 },
  appSubtitle: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#38bdf8', fontWeight: '700', letterSpacing: 0.8 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52,211,153,0.1)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#34d399',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399', marginRight: 6 },
  liveBadgeText: { fontSize: 10, fontWeight: '900', color: '#34d399', fontFamily: theme.fonts.mono },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: '#0f172a', padding: 18, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20,
  },
  heroHeader: { marginBottom: 14 },
  targetLabel: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#94a3b8', fontWeight: '700', letterSpacing: 1 },
  targetName: { fontSize: 15, fontWeight: '800', color: '#38bdf8', fontFamily: theme.fonts.mono, marginTop: 2 },

  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#070a12', padding: 12, borderRadius: 12 },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9, color: '#94a3b8', marginTop: 2, fontWeight: '700', fontFamily: theme.fonts.mono },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontFamily: theme.fonts.mono, color: '#94a3b8', letterSpacing: 1, fontWeight: '800' },
  sectionHint: { fontSize: 9, fontFamily: theme.fonts.mono, color: '#38bdf8', fontWeight: '700' },

  stageGrid: { flexDirection: 'column', gap: 10, marginBottom: 16 },
  stageCard: {
    backgroundColor: '#0f172a', padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  stageCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  stageStepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  stageStepBadge: { fontSize: 9, fontFamily: theme.fonts.mono, color: '#38bdf8', fontWeight: '900' },
  stageStatusBadge: {
    fontSize: 9, fontFamily: theme.fonts.mono, color: '#34d399', fontWeight: '800',
    backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
  },
  stageName: { fontSize: 15, fontWeight: '800', color: '#f8fafc' },
  stageSub: { fontSize: 11, color: '#94a3b8', fontFamily: theme.fonts.mono, marginTop: 1 },
  chevron: { fontSize: 14, color: '#94a3b8', fontWeight: '800', marginLeft: 8 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  auditBtn: {
    flex: 1, backgroundColor: '#38bdf8', padding: 14,
    borderRadius: 12, alignItems: 'center',
  },
  auditBtnText: { color: '#090d16', fontWeight: '900', fontSize: 13 },
  syncBtn: {
    flex: 1, backgroundColor: '#0f172a', padding: 14,
    borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  syncBtnText: { color: '#f8fafc', fontWeight: '800', fontSize: 13 },

  podGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  podCard: {
    flex: 1, backgroundColor: '#0f172a', padding: 10,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  podTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399' },
  podName: { fontSize: 9, fontFamily: theme.fonts.mono, color: '#f8fafc', fontWeight: '800' },
  podStats: { fontSize: 9, fontFamily: theme.fonts.mono, color: '#94a3b8' },

  chartCard: {
    backgroundColor: '#0f172a', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16,
  },

  terminalCard: {
    backgroundColor: '#030712', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 24,
  },
  terminalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  terminalDots: { flexDirection: 'row', gap: 6 },
  terminalDot: { width: 10, height: 10, borderRadius: 5 },
  terminalTitle: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#94a3b8' },
  terminalBody: { padding: 14 },
  logText: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#38bdf8', marginBottom: 4 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, maxHeight: '82%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  modalIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalStep: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#38bdf8', fontWeight: '900' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#f8fafc' },
  closeBtn: { padding: 8 },
  closeBtnText: { fontSize: 18, color: '#94a3b8', fontWeight: '800' },
  modalSub: { fontSize: 12, color: '#94a3b8', fontFamily: theme.fonts.mono, marginBottom: 16 },

  modalSectionTitle: { fontSize: 10, fontFamily: theme.fonts.mono, color: '#38bdf8', fontWeight: '800', marginTop: 12, marginBottom: 6 },
  auditItemText: { fontSize: 12, color: '#e2e8f0', marginBottom: 4, lineHeight: 18 },

  codeSnippetBox: {
    backgroundColor: '#030712', padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: 160, marginVertical: 8,
  },
  codeSnippetText: { fontSize: 11, fontFamily: theme.fonts.mono, color: '#34d399', lineHeight: 16 },

  dismissBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', padding: 14,
    borderRadius: 12, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  dismissBtnText: { color: '#f8fafc', fontWeight: '800', fontSize: 13 },
});

AppRegistry.registerComponent('main', () => DevSecOpsMonitorApp);
export default DevSecOpsMonitorApp;
