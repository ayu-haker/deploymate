import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { theme } from '../../src/theme/tokens';
import { MOCK_PIPELINES, PipelineRun } from '../../src/data/mockData';
import { FlightPathStepper } from '../../src/components/FlightPathStepper';

const FILTERS = ['ALL', 'RUNNING', 'SUCCESS', 'FAILED'] as const;
type Filter = typeof FILTERS[number];

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All', RUNNING: 'Running', SUCCESS: 'Success', FAILED: 'Failed',
};

export default function PipelinesScreen() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [logExpanded, setLogExpanded] = useState(true);

  const filteredRuns = filter === 'ALL' ? MOCK_PIPELINES : MOCK_PIPELINES.filter(p => p.status === filter);

  const handleRedeploy = (run: PipelineRun) => {
    Alert.alert('Redeploy Triggered 🚀', `Redeploying pipeline #${run.id} for ${run.environment}.`);
    setSelectedRun(null);
  };
  const handleRollback = (run: PipelineRun) => {
    Alert.alert('Roll Back Executed ⏪', `Rolled back ${run.projectName} to commit ${run.commitHash}.`);
    setSelectedRun(null);
  };

  return (
    <View style={styles.safe}>

      {/* Segmented Filter */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmented}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.segBtn, filter === f && styles.segBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.segText, filter === f && styles.segTextActive]}>
                {FILTER_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredRuns.map(run => {
          const sc = run.status === 'SUCCESS' ? theme.colors.healthy
            : run.status === 'FAILED' ? theme.colors.error : theme.colors.signal;
          return (
            <TouchableOpacity
              key={run.id}
              style={[styles.card, run.status === 'FAILED' && styles.cardFailed]}
              onPress={() => setSelectedRun(run)}
            >
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={styles.badgeRow}>
                  <View style={[styles.dot, { backgroundColor: sc }]} />
                  <Text style={[styles.statusLabel, { color: sc }]}>{run.status}</Text>
                </View>
                <Text style={styles.relTime}>{run.relativeTime}</Text>
              </View>

              <Text style={styles.projectTitle}>{run.projectName}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.branchText}>git: {run.branch}</Text>
                <Text style={styles.hashText}>{run.commitHash}</Text>
              </View>

              <Text style={styles.commitMsg} numberOfLines={2}>{run.commitMessage}</Text>

              <View style={styles.cardBottom}>
                <Text style={styles.envTag}>Target: {run.environment}</Text>
                <Text style={styles.durationText}>⏱ {run.duration}</Text>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.redeployBtn} onPress={() => handleRedeploy(run)}>
                  <Text style={styles.redeployText}>Redeploy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rollbackBtn} onPress={() => handleRollback(run)}>
                  <Text style={styles.rollbackText}>Roll back</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedRun} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalSheet}>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {selectedRun && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedRun.projectName}</Text>
                    <TouchableOpacity onPress={() => setSelectedRun(null)} style={styles.closeBtn}>
                      <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSub}>
                    Commit {selectedRun.commitHash} · {selectedRun.author}
                  </Text>

                  <FlightPathStepper stages={selectedRun.stages} />

                  {selectedRun.stages.some(s => s.logSnippet) && (
                    <View style={styles.logBox}>
                      <TouchableOpacity
                        style={styles.logBoxHeader}
                        onPress={() => setLogExpanded(!logExpanded)}
                      >
                        <Text style={styles.logBoxTitle}>⚠️ FAILED STAGE LOG</Text>
                        <Text style={styles.logToggle}>{logExpanded ? 'Collapse ▲' : 'Expand ▼'}</Text>
                      </TouchableOpacity>
                      {logExpanded && (
                        <Text style={styles.logText}>
                          {selectedRun.stages.find(s => s.logSnippet)?.logSnippet}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => handleRedeploy(selectedRun)}>
                      <Text style={styles.primaryBtnText}>🚀 Redeploy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleRollback(selectedRun)}>
                      <Text style={styles.secondaryBtnText}>⏪ Roll Back</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  segmentWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceFill,
    padding: 4, borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: theme.radii.sm },
  segBtnActive: { backgroundColor: theme.colors.signal },
  segText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  segTextActive: { color: '#000', fontWeight: '900' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  card: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 12,
  },
  cardFailed: { borderColor: theme.colors.error },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  statusLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  relTime: { fontSize: 11, color: theme.colors.textSecondary },
  projectTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  branchText: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textSecondary },
  hashText: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.signal },
  commitMsg: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  envTag: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  durationText: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textPrimary },
  quickActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 8 },
  redeployBtn: {
    backgroundColor: theme.colors.signal,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radii.sm,
  },
  redeployText: { color: '#000', fontWeight: '800', fontSize: 12 },
  rollbackBtn: {
    backgroundColor: 'rgba(251,113,133,0.12)',
    borderWidth: 1, borderColor: theme.colors.error,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radii.sm,
  },
  rollbackText: { color: theme.colors.error, fontWeight: '800', fontSize: 12 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
    borderTopWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 19, fontWeight: '900', color: theme.colors.textPrimary, flex: 1 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: theme.colors.textSecondary },
  modalSub: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textSecondary, marginBottom: 14 },
  logBox: {
    backgroundColor: '#180e15', padding: 14, borderRadius: theme.radii.md,
    borderWidth: 1, borderColor: theme.colors.error, marginVertical: 12,
  },
  logBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logBoxTitle: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.error, fontWeight: '800' },
  logToggle: { fontSize: 11, color: theme.colors.textSecondary },
  logText: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textPrimary, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  primaryBtn: {
    flex: 1, backgroundColor: theme.colors.signal,
    paddingVertical: 14, borderRadius: theme.radii.md, alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  secondaryBtn: {
    flex: 1, backgroundColor: 'rgba(251,113,133,0.12)',
    borderWidth: 1, borderColor: theme.colors.error,
    paddingVertical: 14, borderRadius: theme.radii.md, alignItems: 'center',
  },
  secondaryBtnText: { color: theme.colors.error, fontWeight: '900', fontSize: 15 },
});
