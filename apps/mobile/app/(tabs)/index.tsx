import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, StatusBar, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/tokens';
import { MOCK_ENVIRONMENTS, MOCK_PIPELINES } from '../../src/data/mockData';
import { TelemetryChart } from '../../src/components/TelemetryChart';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function HomeScreen() {
  const router = useRouter();
  const logout = useAuthStore(s => s.logout);
  const [refreshing, setRefreshing] = useState(false);
  const [pulseOpacity, setPulseOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseOpacity(prev => (prev === 1 ? 0.3 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  const hasFailed = MOCK_PIPELINES.some(p => p.status === 'FAILED');
  const hasDegraded = MOCK_ENVIRONMENTS.some(e => e.status === 'degraded' || e.status === 'down');
  const status = hasFailed || hasDegraded
    ? { title: 'Incident Active (PR-142 Down)', color: theme.colors.error }
    : { title: 'All Systems Operational', color: theme.colors.healthy };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} translucent={false} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.signal} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>DEPLOYMATE</Text>
            <Text style={styles.subHeader}>SRE Mission Control</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={handleLogout}>
            <Text style={styles.avatarText}>AB</Text>
          </TouchableOpacity>
        </View>

        {/* Status Pill */}
        <View style={[styles.statusPill, { borderColor: status.color }]}>
          <View style={[styles.dot, { backgroundColor: status.color, opacity: pulseOpacity }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.title}</Text>
        </View>

        {/* Quick Nav Shortcuts */}
        <View style={styles.shortcutRow}>
          {[
            { label: '📊 Dashboard', route: '/(tabs)/dashboard' as any },
            { label: '📡 Live Logs', route: '/(tabs)/logs' as any },
            { label: '⚙️ Settings', route: '/(tabs)/settings' as any },
          ].map(s => (
            <TouchableOpacity key={s.label} style={styles.shortcutBtn} onPress={() => router.push(s.route)}>
              <Text style={styles.shortcutText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Environments */}
        <Text style={styles.sectionTitle}>ENVIRONMENTS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {MOCK_ENVIRONMENTS.map(env => {
            const sc = env.status === 'healthy' ? theme.colors.healthy : env.status === 'degraded' ? theme.colors.warning : theme.colors.error;
            return (
              <TouchableOpacity
                key={env.id}
                style={styles.envCard}
                onPress={() => router.push('/(tabs)/environments' as any)}
              >
                <View style={styles.envCardTop}>
                  <View style={[styles.dot, { backgroundColor: sc, opacity: env.status !== 'healthy' ? pulseOpacity : 1 }]} />
                  <Text style={styles.envName}>{env.name}</Text>
                </View>
                <Text style={styles.envBranch}>git: {env.branch}</Text>
                <View style={styles.envCardBottom}>
                  <Text style={styles.envHash}>{env.commitHash}</Text>
                  <Text style={styles.envTime}>{env.lastDeployTime}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Telemetry Chart */}
        <TelemetryChart
          title="Deploy Frequency (Last 24h)"
          data={[2, 5, 8, 4, 12, 18, 14, 22, 19, 28, 24, 30]}
          unit="deploys/h"
          currentVal="30"
          color={theme.colors.signal}
        />

        {/* Recent Pipelines */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>RECENT PIPELINE RUNS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/pipelines' as any)}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {MOCK_PIPELINES.slice(0, 5).map(p => {
          const bc = p.status === 'SUCCESS' ? theme.colors.healthy : p.status === 'FAILED' ? theme.colors.error : theme.colors.signal;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.pipelineRow}
              onPress={() => router.push('/(tabs)/pipelines' as any)}
            >
              <View style={styles.pipelineLeft}>
                <View style={[styles.dot, { backgroundColor: bc, width: 8, height: 8, borderRadius: 4, marginRight: 12 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pipelineTitle}>{p.projectName}</Text>
                  <Text style={styles.pipelineCommit} numberOfLines={1}>{p.commitMessage}</Text>
                </View>
              </View>
              <View style={styles.pipelineRight}>
                <Text style={styles.pipelineDuration}>{p.duration}</Text>
                <Text style={styles.pipelineTime}>{p.relativeTime}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  wordmark: { fontSize: 22, fontWeight: '900', color: theme.colors.textPrimary, letterSpacing: 2 },
  subHeader: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: theme.colors.signal,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { color: '#000', fontWeight: '900', fontSize: 15 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surfaceFill,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: theme.radii.pill, borderWidth: 1, marginBottom: 14,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  shortcutRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  shortcutBtn: {
    flex: 1, backgroundColor: theme.colors.cardBg,
    paddingVertical: 10, borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  shortcutText: { color: theme.colors.textPrimary, fontSize: 11, fontWeight: '700' },
  sectionTitle: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.5,
    marginBottom: 10, fontWeight: '700',
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12, marginBottom: 8,
  },
  viewAll: { fontSize: 12, color: theme.colors.signal, fontWeight: '700' },
  envCard: {
    width: 190, backgroundColor: theme.colors.glassBg,
    padding: 14, borderRadius: theme.radii.lg,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder, marginRight: 12,
  },
  envCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  envName: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, flex: 1 },
  envBranch: { fontSize: 11, color: theme.colors.textSecondary, fontFamily: theme.fonts.mono },
  envCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  envHash: { fontSize: 11, color: theme.colors.signal, fontFamily: theme.fonts.mono },
  envTime: { fontSize: 11, color: theme.colors.textSecondary },
  pipelineRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    padding: 14, borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder, marginBottom: 10,
  },
  pipelineLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  pipelineTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary },
  pipelineCommit: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  pipelineRight: { alignItems: 'flex-end' },
  pipelineDuration: { fontSize: 12, fontFamily: theme.fonts.mono, color: theme.colors.textPrimary },
  pipelineTime: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
});
