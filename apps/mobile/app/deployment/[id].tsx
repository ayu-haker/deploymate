import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../src/services/api';

export default function DeploymentTerminalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [logs, setLogs] = useState<Array<{ level: string; message: string; step: string; timestamp: string }>>([
    { level: 'INFO', message: 'Deployment job queued in BullMQ redis worker', step: 'PREPARE', timestamp: new Date().toISOString() },
    { level: 'INFO', message: 'Fetching repository commit metadata', step: 'PREPARE', timestamp: new Date().toISOString() },
    { level: 'INFO', message: 'Installing node_modules dependencies via pnpm', step: 'BUILD', timestamp: new Date().toISOString() },
    { level: 'INFO', message: 'Building Docker multi-stage release image', step: 'BUILD', timestamp: new Date().toISOString() },
    { level: 'INFO', message: 'Running Trivy security vulnerability scanner', step: 'SCAN', timestamp: new Date().toISOString() },
    { level: 'INFO', message: 'Kubernetes rollout starting. Waiting for pod health probes...', step: 'DEPLOY', timestamp: new Date().toISOString() },
  ]);

  const [status, setStatus] = useState<string>('BUILDING');
  const [progress, setProgress] = useState<number>(82);

  useEffect(() => {
    // Connect to WebSocket Gateway for real-time streaming
    const socket: Socket = io(`${API_BASE_URL}/deployments`, {
      transports: ['websocket'],
    });

    socket.emit('join_deployment', { deploymentId: id });

    socket.on('deployment_log', (logEvent) => {
      setLogs((prev) => [...prev, logEvent]);
    });

    socket.on('deployment_status', (statusEvent) => {
      setStatus(statusEvent.status);
      if (statusEvent.status === 'RUNNING') setProgress(100);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const steps = [
    { label: 'Repository', done: true },
    { label: 'Dependencies', done: true },
    { label: 'Build', done: true },
    { label: 'Security Scan', done: true },
    { label: 'Kubernetes Rollout', done: status === 'RUNNING' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Deployment #{id}</Text>

        <View style={styles.stepsContainer}>
          {steps.map((s, idx) => (
            <View key={idx} style={styles.stepRow}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>{s.done ? '✓' : '●'}</Text>
              <Text style={[styles.stepText, s.done && styles.stepDone]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressHeader}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>

      {/* Terminal View */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalTitle}>LIVE TERMINAL LOGS</Text>
        </View>
        <ScrollView style={styles.logScroll}>
          {logs.map((l, i) => (
            <Text key={i} style={styles.logLine}>
              <Text style={{ color: '#64748b' }}>[{l.step}] </Text>
              <Text style={{ color: l.level === 'ERROR' ? '#ef4444' : l.level === 'WARN' ? '#f59e0b' : '#38bdf8' }}>
                {l.message}
              </Text>
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  headerCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  title: { fontSize: 22, color: '#f8fafc', fontWeight: '800', marginBottom: 12 },
  stepsContainer: { marginVertical: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  stepText: { color: '#94a3b8', fontSize: 14 },
  stepDone: { color: '#10b981', fontWeight: '700' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBg: { flex: 1, height: 10, backgroundColor: '#1e293b', borderRadius: 5, marginRight: 12, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: '#38bdf8', borderRadius: 5 },
  progressText: { color: '#38bdf8', fontWeight: '800', fontSize: 14 },
  terminalContainer: { flex: 1, backgroundColor: '#030712', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  terminalHeader: { backgroundColor: '#0f172a', padding: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  terminalTitle: { color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  logScroll: { padding: 12 },
  logLine: { fontSize: 12, fontFamily: 'monospace', marginVertical: 3, lineHeight: 18 },
});
