import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../src/services/api';
import { theme } from '../../src/theme/tokens';

const MOCK_PROJECTS = [
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

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.signal} />}
      >
        {/* Hero Stats Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>COMMAND CENTER SUMMARY</Text>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <Text style={styles.heroNumber}>{display.length}</Text>
          <Text style={styles.heroSub}>Total Monitored Projects</Text>

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

        {/* Active Deployments */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>ACTIVE DEPLOYMENTS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/projects' as any)}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {display.map((p: any) => {
          const status = p.lastDeployment?.status ?? 'IDLE';
          const isFailed = status === 'FAILED';
          const isRunning = status === 'RUNNING';
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
    borderColor: theme.colors.surfaceBorder, marginBottom: 20,
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
  heroNumber: { fontSize: 48, fontWeight: '900', color: theme.colors.signal, lineHeight: 52 },
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
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.5, fontWeight: '700',
  },
  viewAll: { fontSize: 12, color: theme.colors.signal, fontWeight: '700' },

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
