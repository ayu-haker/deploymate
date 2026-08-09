import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { theme } from '../../src/theme/tokens';
import { MOCK_ENVIRONMENTS, Environment } from '../../src/data/mockData';
import { TelemetryChart } from '../../src/components/TelemetryChart';

export default function EnvironmentsScreen() {
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(MOCK_ENVIRONMENTS[0]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const toggleReveal = (key: string) =>
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>MANAGED ENVIRONMENTS</Text>

        {/* 2-Column Grid */}
        <View style={styles.grid}>
          {MOCK_ENVIRONMENTS.map(env => {
            const sc = env.status === 'healthy' ? theme.colors.healthy
              : env.status === 'degraded' ? theme.colors.warning : theme.colors.error;
            const selected = selectedEnv?.id === env.id;
            return (
              <TouchableOpacity
                key={env.id}
                style={[styles.gridCard, selected && styles.gridCardActive]}
                onPress={() => setSelectedEnv(env)}
              >
                <View style={styles.gridCardTop}>
                  <View style={[styles.dot, { backgroundColor: sc }]} />
                  <Text style={styles.gridEnvName} numberOfLines={1}>{env.name}</Text>
                </View>
                <Text style={styles.gridHash}>git: {env.commitHash}</Text>
                <Text style={styles.gridUptime}>Uptime: {env.uptime}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detail Section */}
        {selectedEnv && (
          <View>
            {/* Header Card */}
            <View style={styles.detailCard}>
              <View>
                <Text style={styles.detailTitle}>{selectedEnv.name} Telemetry</Text>
                <Text style={styles.detailSub}>Branch: {selectedEnv.branch} · {selectedEnv.lastDeployTime}</Text>
              </View>
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={styles.redeployBtn}
                  onPress={() => Alert.alert('Redeploy 🚀', `Triggered deployment to ${selectedEnv.name}.`)}
                >
                  <Text style={styles.redeployBtnText}>Redeploy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.restartBtn}
                  onPress={() => Alert.alert('Restart 🔄', `Restarted pods for ${selectedEnv.name}.`)}
                >
                  <Text style={styles.restartBtnText}>Restart</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Telemetry Charts */}
            <Text style={styles.sectionLabel}>TELEMETRY READOUTS</Text>
            <TelemetryChart
              title="CPU Usage"
              data={selectedEnv.cpuUsage}
              unit="%"
              currentVal={selectedEnv.cpuUsage[selectedEnv.cpuUsage.length - 1]}
              color={selectedEnv.status === 'down' ? theme.colors.error : theme.colors.signal}
            />
            <TelemetryChart
              title="Memory Usage"
              data={selectedEnv.memoryUsage}
              unit="MB"
              currentVal={selectedEnv.memoryUsage[selectedEnv.memoryUsage.length - 1]}
              color={theme.colors.warning}
            />
            <TelemetryChart
              title="Avg Response Time"
              data={selectedEnv.responseTime}
              unit="ms"
              currentVal={selectedEnv.responseTime[selectedEnv.responseTime.length - 1]}
              color={selectedEnv.status === 'healthy' ? theme.colors.healthy : theme.colors.error}
            />

            {/* Services Health */}
            <Text style={styles.sectionLabel}>DEPLOYED SERVICES</Text>
            <View style={styles.listCard}>
              {selectedEnv.services.map((svc, idx) => {
                const sc = svc.status === 'healthy' ? theme.colors.healthy
                  : svc.status === 'degraded' ? theme.colors.warning : theme.colors.error;
                return (
                  <View
                    key={idx}
                    style={[styles.listRow, idx === selectedEnv.services.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.svcLeft}>
                      <View style={[styles.dot, { backgroundColor: sc }]} />
                      <Text style={styles.svcName}>{svc.name}</Text>
                    </View>
                    <Text style={[styles.svcLatency, { color: sc }]}>
                      {svc.status === 'down' ? 'DOWN' : `${svc.latency}ms`}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Env Vars */}
            <Text style={styles.sectionLabel}>ENVIRONMENT VARIABLES</Text>
            <View style={styles.listCard}>
              {selectedEnv.envVars.map((v, idx) => {
                const revealed = !!revealedKeys[v.key];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.listRow, idx === selectedEnv.envVars.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => toggleReveal(v.key)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.envKey}>{v.key}</Text>
                      <Text style={styles.envVal}>{revealed ? v.value : '•••••••••••••••••••••••'}</Text>
                    </View>
                    <Text style={styles.revealHint}>{revealed ? 'Hide 🔒' : 'Reveal 👁️'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.5,
    fontWeight: '700', marginBottom: 10, marginTop: 16,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  gridCard: {
    flex: 1, minWidth: '45%', backgroundColor: theme.colors.cardBg,
    padding: 12, borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  gridCardActive: { borderColor: theme.colors.signal, backgroundColor: 'rgba(91,140,255,0.08)' },
  gridCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  gridEnvName: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary, flex: 1 },
  gridHash: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.signal, marginTop: 2 },
  gridUptime: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 },
  detailCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    padding: 14, borderRadius: theme.radii.lg,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  detailTitle: { fontSize: 16, fontWeight: '900', color: theme.colors.textPrimary },
  detailSub: { fontSize: 11, color: theme.colors.textSecondary, fontFamily: theme.fonts.mono, marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  redeployBtn: {
    backgroundColor: theme.colors.signal,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radii.sm,
  },
  redeployBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
  restartBtn: {
    backgroundColor: theme.colors.surfaceFill, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radii.sm,
  },
  restartBtnText: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 12 },
  listCard: {
    backgroundColor: theme.colors.cardBg, padding: 4,
    borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder, marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceBorder,
  },
  svcLeft: { flexDirection: 'row', alignItems: 'center' },
  svcName: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  svcLatency: { fontSize: 12, fontFamily: theme.fonts.mono, fontWeight: '700' },
  envKey: { fontSize: 12, fontFamily: theme.fonts.mono, color: theme.colors.signal, fontWeight: '700' },
  envVal: { fontSize: 12, fontFamily: theme.fonts.mono, color: theme.colors.textSecondary, marginTop: 2 },
  revealHint: { fontSize: 11, color: theme.colors.textMuted },
});
