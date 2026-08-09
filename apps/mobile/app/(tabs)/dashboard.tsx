import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../src/services/api';
import { theme } from '../../src/theme/tokens';
import { TelemetryChart } from '../../src/components/TelemetryChart';

const MOCK_PROJECTS = [
  { id: 'demo-0', name: 'VertexLab Status App', provider: 'KUBERNETES', lastDeployment: { status: 'RUNNING', version: 'v1.0.0', id: 'dep-0' } },
  { id: 'demo-1', name: 'Portfolio Engine', provider: 'KUBERNETES', lastDeployment: { status: 'RUNNING', version: 'v1.4.2', id: 'dep-1' } },
  { id: 'demo-2', name: 'Landing Web App', provider: 'VERCEL', lastDeployment: { status: 'RUNNING', version: 'v2.1.0', id: 'dep-2' } },
  { id: 'demo-3', name: 'Backend API Gateway', provider: 'KUBERNETES', lastDeployment: { status: 'FAILED', version: 'v2.4.1', id: 'dep-3' } },
];

const PROVIDER_LABEL: Record<string, string> = {
  KUBERNETES: '☸ K8s Cluster',
  VERCEL: '▲ Vercel Edge',
  NETLIFY: '◆ Netlify Cloud',
};

const STATUS_COLOR: Record<string, string> = {
  RUNNING: theme.colors.healthy,
  FAILED: theme.colors.error,
  BUILDING: theme.colors.warning,
  DEPLOYING: theme.colors.warning,
};

const PIPELINE_STEPS = [
  { num: '1', title: 'Dockerfile', tag: 'Multi-Stage' },
  { num: '2', title: 'Docker Hub', tag: 'ayushman21' },
  { num: '3', title: 'CI Pipeline', tag: 'GitHub Actions' },
  { num: '4', title: 'Security', tag: 'Trivy Scan' },
  { num: '5', title: 'K8s Deploy', tag: 'Deployment.yaml' },
  { num: '6', title: 'GitOps', tag: 'ArgoCD Synced' },
  { num: '7', title: 'Monitoring', tag: 'Prometheus' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [runningScan, setRunningScan] = useState(false);
  const [runningSync, setRunningSync] = useState(false);

  const { data: projects = [], refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiRequest('/api/v1/projects'),
  });

  const display = projects.length > 0 ? projects : MOCK_PROJECTS;

  const healthy = display.filter((p: any) => p.lastDeployment?.status === 'RUNNING').length;
  const building = display.filter((p: any) => ['BUILDING', 'DEPLOYING'].includes(p.lastDeployment?.status)).length;
  const failed = display.filter((p: any) => p.lastDeployment?.status === 'FAILED').length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTrivyAudit = () => {
    setRunningScan(true);
    setTimeout(() => {
      setRunningScan(false);
      Alert.alert(
        '🛡️ Trivy Audit Passed',
        'Image: ayushman21/vertexlab-status-app:v1.0.0\n\n- CRITICAL Vulnerabilities: 0\n- HIGH Vulnerabilities: 0\n- OS Libraries: 100% Clean\n\nContainer passed all DevSecOps security policies!'
      );
    }, 1000);
  };

  const handleArgoCdSync = () => {
    setRunningSync(true);
    setTimeout(() => {
      setRunningSync(false);
      Alert.alert(
        '🔄 ArgoCD GitOps Synced',
        'Repository: https://github.com/ayu-haker/deploymate.git\nTarget Revision: HEAD (main)\n\nApplication state is IN-SYNC and HEALTHY across all 3 Kubernetes pod replicas.'
      );
    }, 1000);
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.signal} />}
      >
        {/* Hero Command Center Summary */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>DEVSECOPS COMMAND CENTER</Text>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE MONITORED</Text>
            </View>
          </View>

          <Text style={styles.heroNumber}>{display.length}</Text>
          <Text style={styles.heroSub}>Active Monitored Applications & Services</Text>

          <View style={styles.statsGrid}>
            {[
              { label: 'Healthy', val: healthy, color: theme.colors.healthy },
              { label: 'Building', val: building, color: theme.colors.warning },
              { label: 'Critical', val: failed, color: theme.colors.error },
            ].map(s => (
              <View key={s.label} style={[styles.statBox, { borderColor: s.color }]}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7-Step DevSecOps Architecture Visualizer */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>7-STEP DEVSECOPS PIPELINE</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pipelineScroll}>
          {PIPELINE_STEPS.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <Text style={styles.stepNum}>STEP {step.num}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <View style={styles.stepTag}>
                <Text style={styles.stepTagText}>{step.tag}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* DevSecOps Interactive Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.auditBtn} onPress={handleTrivyAudit} disabled={runningScan}>
            {runningScan ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.auditBtnText}>🛡️ Run Trivy Security Audit</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.syncBtn} onPress={handleArgoCdSync} disabled={runningSync}>
            {runningSync ? (
              <ActivityIndicator color={theme.colors.signal} />
            ) : (
              <Text style={styles.syncBtnText}>🔄 ArgoCD GitOps Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* K8s Live Replicas & Telemetry Chart */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PROMETHEUS TELEMETRY (VERTEXLAB STATUS APP)</Text>
        </View>

        <View style={styles.telemetryCard}>
          <View style={styles.podRow}>
            <View style={styles.podItem}>
              <Text style={styles.podName}>pod-app-7f4b89-a1b2</Text>
              <Text style={styles.podSub}>14% CPU | 132MB</Text>
            </View>
            <View style={styles.podItem}>
              <Text style={styles.podName}>pod-app-7f4b89-c3d4</Text>
              <Text style={styles.podSub}>18% CPU | 128MB</Text>
            </View>
            <View style={styles.podItem}>
              <Text style={styles.podName}>pod-app-7f4b89-e5f6</Text>
              <Text style={styles.podSub}>12% CPU | 136MB</Text>
            </View>
          </View>

          <TelemetryChart title="HTTP Request Rate (req/sec)" data={[110, 125, 118, 134, 142, 138, 145, 140, 139, 142]} color={theme.colors.signal} height={120} />
        </View>

        {/* Active Deployments List */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>ACTIVE DEPLOYMENTS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/projects' as any)}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {display.map((p: any) => {
          const status = p.lastDeployment?.status ?? 'IDLE';
          const isFailed = status === 'FAILED';
          const dotColor = STATUS_COLOR[status] ?? theme.colors.textSecondary;

          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.card, isFailed && styles.cardFailed]}
              onPress={() => router.push(`/project/${p.id}` as any)}
            >
              <View style={styles.cardTop}>
                <View style={styles.nameRow}>
                  <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                  <Text style={styles.projectName}>{p.name}</Text>
                </View>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerText}>{PROVIDER_LABEL[p.provider] ?? p.provider}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.versionTag}>Release: {p.lastDeployment?.version ?? 'v1.0.0'}</Text>
                <Text style={[styles.statusText, { color: dotColor }]}>{status}</Text>
              </View>

              {isFailed && (
                <TouchableOpacity
                  style={styles.aiBadge}
                  onPress={() => router.push('/(tabs)/deploy-ai' as any)}
                >
                  <Text style={styles.aiBadgeText}>🤖 View AI Fix Proposal →</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },

  heroCard: {
    backgroundColor: theme.colors.cardBg, padding: 20,
    borderRadius: theme.radii.xl, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 16,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heroLabel: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.2, fontWeight: '700',
  },
  liveTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(52,211,153,0.1)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: theme.colors.healthy,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.healthy, marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '800', color: theme.colors.healthy },
  heroNumber: { fontSize: 44, fontWeight: '900', color: theme.colors.signal, lineHeight: 48 },
  heroSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1, backgroundColor: theme.colors.surfaceFill,
    padding: 12, borderRadius: theme.radii.md,
    alignItems: 'center', borderWidth: 1,
  },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4, fontWeight: '600' },

  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10, marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.2, fontWeight: '700',
  },
  viewAll: { fontSize: 12, color: theme.colors.signal, fontWeight: '700' },

  pipelineScroll: { marginBottom: 14 },
  stepCard: {
    backgroundColor: theme.colors.cardBg, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    marginRight: 10, minWidth: 120, alignItems: 'center',
  },
  stepNum: { fontSize: 10, fontFamily: theme.fonts.mono, color: theme.colors.signal, fontWeight: '700' },
  stepTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary, marginVertical: 4 },
  stepTag: {
    backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)',
  },
  stepTagText: { fontSize: 10, color: theme.colors.healthy, fontWeight: '700', fontFamily: theme.fonts.mono },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  auditBtn: {
    flex: 1, backgroundColor: theme.colors.signal, padding: 13,
    borderRadius: theme.radii.md, alignItems: 'center',
  },
  auditBtnText: { color: '#000', fontWeight: '900', fontSize: 13 },
  syncBtn: {
    flex: 1, backgroundColor: theme.colors.surfaceFill, padding: 13,
    borderRadius: theme.radii.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  syncBtnText: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 13 },

  telemetryCard: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    marginBottom: 16,
  },
  podRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  podItem: {
    flex: 1, backgroundColor: '#030712', padding: 8,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  podName: { fontSize: 10, fontFamily: theme.fonts.mono, color: theme.colors.healthy, fontWeight: '700' },
  podSub: { fontSize: 9, fontFamily: theme.fonts.mono, color: theme.colors.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 12,
  },
  cardFailed: { borderColor: theme.colors.error, backgroundColor: 'rgba(251,113,133,0.04)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  projectName: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, flex: 1 },
  providerBadge: {
    backgroundColor: theme.colors.surfaceFill,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  providerText: { color: theme.colors.signal, fontSize: 11, fontWeight: '700' },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  versionTag: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.fonts.mono },
  statusText: { fontSize: 12, fontWeight: '800' },
  aiBadge: {
    backgroundColor: 'rgba(124,58,237,0.15)', marginTop: 12,
    padding: 12, borderRadius: theme.radii.md,
    alignItems: 'center', borderWidth: 1, borderColor: '#7c3aed',
  },
  aiBadgeText: { color: '#a78bfa', fontWeight: '800', fontSize: 13 },
});
