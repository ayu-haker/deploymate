import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../src/services/api';

export default function AIFixScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'FIX'>('ANALYSIS');

  const { data, isLoading } = useQuery({
    queryKey: ['ai-diagnose', id],
    queryFn: () => apiRequest(`/api/v1/ai/diagnose/${id}`, { method: 'POST' }),
    enabled: !!id && !id.toString().startsWith('dep-3'),
  });

  const approveMutation = useMutation({
    mutationFn: (fixId: string) => apiRequest(`/api/v1/ai/fix/${fixId}/approve`, { method: 'POST' }),
    onSuccess: (res: any) => {
      Alert.alert('Fix Applied Successfully', res.message || 'Pull request created and redeployment queued.');
      router.replace('/(tabs)/dashboard');
    },
    onError: (err: any) => Alert.alert('Approval Failed', err.message),
  });

  // Mock empirical fallback diagnosis data for interactive demo preview matching wireframe #18
  const analysis = data?.analysis || {
    id: 'an-1',
    severity: 'HIGH',
    problem: 'CrashLoopBackOff',
    rootCause: 'Application container failed to start because required DATABASE_URL environment variable is missing.',
    confidence: 0.96,
    suggestedFix: 'Configure DATABASE_URL key in project environment variables and trigger redeploy.',
    action: 'UPDATE_ENVIRONMENT',
  };

  const fix = data?.fix || {
    id: 'fix-1',
    diff: `--- a/deployment.yaml\n+++ b/deployment.yaml\n@@ -15,4 +15,6 @@\n       env:\n         - name: PORT\n           value: "3000"\n+        - name: DATABASE_URL\n+          value: "postgresql://usr:pwd@host:5432/db"`,
    action: 'UPDATE_ENVIRONMENT',
    branchName: 'fix/deploymate-database-url-patch',
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ color: '#94a3b8', marginTop: 12 }}>🤖 Self-Hosted AI Analyzing Sanitized Logs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.failBanner}>
        <Text style={styles.failTitle}>🔴 Deployment Failed</Text>
        <Text style={styles.problemTag}>{analysis.problem}</Text>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ANALYSIS' && styles.tabActive]}
          onPress={() => setActiveTab('ANALYSIS')}
        >
          <Text style={[styles.tabText, activeTab === 'ANALYSIS' && styles.tabTextActive]}>🤖 AI Diagnosis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FIX' && styles.tabActive]}
          onPress={() => setActiveTab('FIX')}
        >
          <Text style={[styles.tabText, activeTab === 'FIX' && styles.tabTextActive]}>🔧 Proposed Patch</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ANALYSIS' ? (
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Root Cause Analysis</Text>
          <Text style={styles.rootCauseText}>{analysis.rootCause}</Text>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Confidence Score</Text>
              <Text style={styles.confidenceVal}>{Math.round(analysis.confidence * 100)}%</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Severity Level</Text>
              <Text style={[styles.severityVal, { color: analysis.severity === 'HIGH' ? '#ef4444' : '#f59e0b' }]}>
                {analysis.severity}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Recommended Action</Text>
          <Text style={styles.suggestedFixText}>{analysis.suggestedFix}</Text>

          <TouchableOpacity style={styles.switchBtn} onPress={() => setActiveTab('FIX')}>
            <Text style={styles.switchBtnText}>View Proposed Fix & Diff →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🤖 Proposed Git Patch</Text>
          <Text style={styles.fileName}>deployment.yaml</Text>

          {/* Unified Diff Box */}
          <View style={styles.diffBox}>
            {fix.diff.split('\n').map((line: string, idx: number) => {
              const isAdd = line.startsWith('+');
              const isRem = line.startsWith('-');
              return (
                <Text
                  key={idx}
                  style={[
                    styles.diffLine,
                    isAdd && styles.diffAdd,
                    isRem && styles.diffRem,
                  ]}
                >
                  {line}
                </Text>
              );
            })}
          </View>

          <View style={styles.riskRow}>
            <Text style={styles.metaLabel}>Action Risk Level:</Text>
            <Text style={{ color: '#f59e0b', fontWeight: '800', marginLeft: 8 }}>MEDIUM</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => router.back()}>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => approveMutation.mutate(fix.id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.approveText}>Approve & Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  failBanner: { backgroundColor: '#180e15', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginBottom: 16 },
  failTitle: { color: '#ef4444', fontSize: 18, fontWeight: '800' },
  problemTag: { color: '#f8fafc', fontSize: 14, fontFamily: 'monospace', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 8, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  rootCauseText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' },
  metaLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  confidenceVal: { color: '#10b981', fontSize: 20, fontWeight: '900', marginTop: 2 },
  severityVal: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  suggestedFixText: { color: '#38bdf8', fontSize: 14, lineHeight: 20 },
  switchBtn: { backgroundColor: '#7c3aed', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  switchBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  fileName: { color: '#94a3b8', fontSize: 13, fontFamily: 'monospace', marginBottom: 8 },
  diffBox: { backgroundColor: '#030712', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginVertical: 8 },
  diffLine: { fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', marginVertical: 2 },
  diffAdd: { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  diffRem: { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  riskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  rejectBtn: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  rejectText: { color: '#94a3b8', fontWeight: '800' },
  approveBtn: { flex: 2, backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  approveText: { color: '#0f172a', fontWeight: '900', fontSize: 15 },
});
