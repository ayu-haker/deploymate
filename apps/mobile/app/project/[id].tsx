import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../src/services/api';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiRequest(`/api/v1/projects/${id}`),
    enabled: !!id && !id.toString().startsWith('demo'),
  });

  const deployMutation = useMutation({
    mutationFn: () => apiRequest(`/api/v1/deployments/project/${id}`, {
      method: 'POST',
      body: JSON.stringify({ branch: 'main' }),
    }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      router.push(`/deployment/${data.id}`);
    },
    onError: (err: any) => Alert.alert('Deployment Trigger Failed', err.message),
  });

  // Mock project detail fallback for interactive mobile preview
  const displayProject = project || {
    id,
    name: 'Backend API',
    provider: 'KUBERNETES',
    branch: 'main',
    repository: 'ayushman/backend-api',
    liveUrl: 'https://backend-api.deploymate.cluster.local',
    lastDeployment: { status: 'RUNNING', version: 'v2.4.1', id: 'dep-183' },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Project</Text>
        <Text style={styles.projectName}>{displayProject.name}</Text>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Platform</Text>
            <Text style={styles.valHighlight}>
              {displayProject.provider === 'KUBERNETES' ? '☸ Kubernetes' : displayProject.provider === 'VERCEL' ? '▲ Vercel' : '◆ Netlify'}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.valHighlight, { color: '#10b981' }]}>
              🟢 {displayProject.lastDeployment?.status || 'RUNNING'}
            </Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.valCode}>{displayProject.lastDeployment?.version || 'v2.4.1'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Repository</Text>
            <Text style={styles.valCode}>{displayProject.repository}</Text>
          </View>
        </View>
      </View>

      {/* Metrics Section */}
      <View style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>Resource Utilization Metrics</Text>

        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>CPU Usage</Text>
            <Text style={styles.metricVal}>21%</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '21%', backgroundColor: '#38bdf8' }]} />
            </View>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <Text style={styles.metricVal}>43%</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '43%', backgroundColor: '#818cf8' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.btn, styles.btnDeploy]}
          onPress={() => deployMutation.mutate()}
          disabled={deployMutation.isPending}
        >
          <Text style={styles.btnTextDark}>
            {deployMutation.isPending ? 'Queuing Job...' : '🚀 Trigger Deploy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => router.push(`/deployment/${displayProject.lastDeployment?.id || 'dep-183'}`)}
        >
          <Text style={styles.btnTextLight}>📋 View Logs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  card: { backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 12 },
  projectName: { fontSize: 24, color: '#f8fafc', fontWeight: '900', marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  valHighlight: { color: '#38bdf8', fontSize: 16, fontWeight: '800', marginTop: 2 },
  valCode: { color: '#f8fafc', fontSize: 14, fontFamily: 'monospace', marginTop: 2 },
  metricsCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  metricsTitle: { fontSize: 14, color: '#f8fafc', fontWeight: '800', marginBottom: 16 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricBox: { flex: 1, backgroundColor: '#1e293b', padding: 14, borderRadius: 12, marginHorizontal: 4 },
  metricLabel: { color: '#94a3b8', fontSize: 12 },
  metricVal: { color: '#f8fafc', fontSize: 22, fontWeight: '900', marginVertical: 4 },
  progressBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginTop: 4 },
  progressFill: { height: 6, borderRadius: 3 },
  actionGrid: { marginTop: 8 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnDeploy: { backgroundColor: '#38bdf8' },
  btnSecondary: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  btnTextDark: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  btnTextLight: { color: '#f8fafc', fontWeight: '800', fontSize: 16 },
});
