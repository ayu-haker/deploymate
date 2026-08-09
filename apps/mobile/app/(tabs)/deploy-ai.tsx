import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { theme } from '../../src/theme/tokens';

interface Suggestion {
  id: string;
  category: 'DIAGNOSTIC' | 'PERFORMANCE' | 'SECURITY' | 'OPTIMIZATION';
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  recommendation: string;
  codePatch?: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    category: 'DIAGNOSTIC',
    title: 'Upstream OOMKilled in Preview PR-142',
    severity: 'CRITICAL',
    description: 'Container app-pr-142 ran out of memory (peak 1048MB > limit 1024MB) and exited with code 137.',
    recommendation: 'Increase Kubernetes memory request & limit from 1024MB to 2048MB in k8s/deployment.yaml.',
    codePatch: `resources:\n  limits:\n    memory: "2048Mi"\n  requests:\n    memory: "1024Mi"`,
  },
  {
    id: 'sug-2',
    category: 'PERFORMANCE',
    title: 'Bcrypt Thread Bottleneck (280ms latency)',
    severity: 'WARNING',
    description: 'Bcrypt password hashing is blocking the main event loop thread pool in auth-service.',
    recommendation: 'Offload bcrypt hashing to worker thread pool or increase MAX_WORKER_THREADS from 4 to 8.',
    codePatch: `const pool = new WorkerPool({ minWorkers: 4, maxWorkers: 8 });`,
  },
  {
    id: 'sug-3',
    category: 'SECURITY',
    title: 'Unencrypted Database Credentials',
    severity: 'WARNING',
    description: 'Staging environment uses plain text DATABASE_URL string.',
    recommendation: 'Encrypt credentials using DeployMate AES-256 GCM vault.',
  },
];

const SEV_COLOR: Record<string, string> = {
  CRITICAL: theme.colors.error,
  WARNING: theme.colors.warning,
  INFO: theme.colors.signal,
};

export default function DeployAIScreen() {
  const [prompt, setPrompt] = useState('');
  const [asking, setAsking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [fixingId, setFixingId] = useState<string | null>(null);

  const handleAsk = () => {
    if (!prompt.trim()) return;
    const q = prompt.trim();
    setPrompt('');
    setAsking(true);
    setTimeout(() => {
      setAsking(false);
      setAnswers(prev => [
        `🤖 For "${q}": I recommend optimizing multi-stage Docker builds using node:20-alpine to reduce image size by 65% and speed up deployment by 42s. Also consider enabling layer caching in your CI pipeline.`,
        ...prev,
      ]);
    }, 1200);
  };

  const handleFix = (sug: Suggestion) => {
    setFixingId(sug.id);
    setTimeout(() => {
      setFixingId(null);
      Alert.alert('⚡ AI Patch Applied!', `Deploy AI patched "${sug.title}" and triggered pipeline redeploy.`);
    }, 1500);
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>🤖 Deploy AI SRE Assistant</Text>
          <Text style={styles.headerSub}>
            100% Local AI Intelligence. Autonomous root-cause diagnostics, K8s optimizations & 1-tap pipeline auto-fixes.
          </Text>
        </View>

        {/* Ask AI */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>ASK DEPLOY AI</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="e.g. How to fix OOMKilled in K8s pod?"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="send"
              onSubmitEditing={handleAsk}
            />
            <TouchableOpacity style={styles.askBtn} onPress={handleAsk} disabled={asking}>
              {asking
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={styles.askBtnText}>Ask →</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Answers */}
        {answers.map((ans, i) => (
          <View key={i} style={styles.answerCard}>
            <Text style={styles.answerText}>{ans}</Text>
          </View>
        ))}

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>AUTONOMOUS AI DIAGNOSTICS</Text>

        {SUGGESTIONS.map(sug => {
          const color = SEV_COLOR[sug.severity] ?? theme.colors.signal;
          const isCritical = sug.severity === 'CRITICAL';
          const fixing = fixingId === sug.id;

          return (
            <View key={sug.id} style={[styles.sugCard, isCritical && { borderColor: theme.colors.error }]}>
              {/* Severity & Category */}
              <View style={styles.sugTop}>
                <View style={[styles.sevBadge, { backgroundColor: `${color}1A`, borderColor: color }]}>
                  <Text style={[styles.sevText, { color }]}>{sug.severity}</Text>
                </View>
                <Text style={styles.catText}>{sug.category}</Text>
              </View>

              <Text style={styles.sugTitle}>{sug.title}</Text>
              <Text style={styles.sugDesc}>{sug.description}</Text>

              {/* Recommendation box */}
              <View style={styles.recBox}>
                <Text style={styles.recLabel}>💡 AI RECOMMENDATION</Text>
                <Text style={styles.recText}>{sug.recommendation}</Text>
                {sug.codePatch && (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{sug.codePatch}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.applyBtn, isCritical && { backgroundColor: theme.colors.error }]}
                onPress={() => handleFix(sug)}
                disabled={fixing}
              >
                {fixing
                  ? <ActivityIndicator color={isCritical ? '#fff' : '#000'} />
                  : <Text style={[styles.applyBtnText, isCritical && { color: '#fff' }]}>
                      ⚡ Apply AI Patch & Redeploy
                    </Text>
                }
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36 },
  headerCard: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.signal },
  headerSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 },
  promptCard: {
    backgroundColor: theme.colors.cardBg, padding: 14,
    borderRadius: theme.radii.md, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 14,
  },
  promptLabel: {
    fontSize: 10, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.2,
    fontWeight: '800', marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#030508',
    color: theme.colors.textPrimary,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: theme.radii.sm, fontSize: 13,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  askBtn: {
    backgroundColor: theme.colors.signal, paddingHorizontal: 16,
    justifyContent: 'center', borderRadius: theme.radii.sm, minWidth: 60,
  },
  askBtnText: { color: '#000', fontWeight: '900', fontSize: 13 },
  answerCard: {
    backgroundColor: 'rgba(91,140,255,0.08)', padding: 14,
    borderRadius: theme.radii.md, borderWidth: 1,
    borderColor: theme.colors.signal, marginBottom: 12,
  },
  answerText: { color: theme.colors.textPrimary, fontSize: 13, lineHeight: 20 },
  sectionLabel: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, letterSpacing: 1.5,
    fontWeight: '700', marginBottom: 12,
  },
  sugCard: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 14,
  },
  sugTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  sevText: { fontSize: 10, fontFamily: theme.fonts.mono, fontWeight: '900' },
  catText: { fontSize: 10, fontFamily: theme.fonts.mono, color: theme.colors.textSecondary },
  sugTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  sugDesc: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  recBox: {
    backgroundColor: '#030508', padding: 12,
    borderRadius: theme.radii.sm, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 12,
  },
  recLabel: {
    fontSize: 10, fontFamily: theme.fonts.mono,
    color: theme.colors.healthy, fontWeight: '800', marginBottom: 4,
  },
  recText: { fontSize: 12, color: theme.colors.textPrimary, lineHeight: 18 },
  codeBox: {
    backgroundColor: '#090d16', padding: 8,
    borderRadius: 4, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  codeText: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.signal },
  applyBtn: {
    backgroundColor: theme.colors.signal,
    paddingVertical: 12, borderRadius: theme.radii.md, alignItems: 'center',
  },
  applyBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
