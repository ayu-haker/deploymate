import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { theme } from '../../src/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const [aiLocal, setAiLocal] = useState(true);
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [alerts, setAlerts] = useState(true);

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'DeployMate — SRE Mobile Command Center',
        message: '🚀 Try DeployMate! Monitor K8s, Vercel & Netlify from your phone.\n\nhttps://deploymate.io/download\nInvite Code: DEPLOYMATE-PRO-2026',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AB';

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Ayushman Bosu Roy'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'dev@deploymate.io'}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>⚡ SRE Owner</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified OTP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Share & Invite */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎁 Developer Referral & Share</Text>
          <Text style={styles.cardDesc}>Share DeployMate with your engineering team to collaborate on live deployments.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleShare}>
            <Text style={styles.primaryBtnText}>🚀 Share DeployMate App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Alert.alert('Copied 📋', 'Invite code DEPLOYMATE-PRO-2026 copied!')}
          >
            <Text style={styles.secondaryBtnText}>📋 Copy Invite Code: DEPLOYMATE-PRO-2026</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Platform & AI Preferences</Text>

          {[
            {
              label: 'Local Ollama AI Inference',
              desc: 'Run Llama3/CodeLlama locally at localhost:11434 (100% private)',
              val: aiLocal, set: setAiLocal,
            },
            {
              label: 'Real-time WebSocket Sync',
              desc: 'Stream live Kubernetes pod logs & deployment events instantly',
              val: realtimeSync, set: setRealtimeSync,
            },
            {
              label: 'Deployment Failure Alerts',
              desc: 'Push alerts when a build or pod crashes',
              val: alerts, set: setAlerts,
            },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={item.val}
                  onValueChange={item.set}
                  trackColor={{ false: '#334155', true: theme.colors.signal }}
                  thumbColor="#f8fafc"
                />
              </View>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* System Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Architecture & System Info</Text>
          {[
            ['App Build Version', 'v1.0.4-release (Production)'],
            ['JS Engine', 'Hermes (SharedArrayBuffer Enabled)'],
            ['Security Policy', 'AES-256 Expo SecureStore & JWT'],
            ['API Endpoint', 'http://10.16.1.67:3000 (Wi-Fi)'],
          ].map(([label, val], idx) => (
            <View
              key={label}
              style={[styles.infoRow, idx === 3 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoVal}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🔒 Sign Out & Lock App</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.cardBg, padding: 18,
    borderRadius: theme.radii.lg, borderWidth: 1.5,
    borderColor: theme.colors.signal, marginBottom: 16,
  },
  avatarCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: theme.colors.signal,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#000' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  userEmail: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  roleBadge: {
    backgroundColor: theme.colors.surfaceFill,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.signal },
  verifiedBadge: {
    backgroundColor: 'rgba(52,211,153,0.1)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.healthy,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: theme.colors.healthy },

  card: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  cardDesc: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 14 },

  primaryBtn: {
    backgroundColor: theme.colors.signal,
    padding: 14, borderRadius: theme.radii.md,
    alignItems: 'center', marginBottom: 10,
  },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: theme.colors.surfaceFill, padding: 12,
    borderRadius: theme.radii.md, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  secondaryBtnText: { color: theme.colors.signal, fontWeight: '700', fontSize: 13 },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  toggleInfo: { flex: 1, paddingRight: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  toggleDesc: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.surfaceBorder },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceBorder,
  },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary, flex: 1 },
  infoVal: { fontSize: 12, color: theme.colors.signal, fontWeight: '600', flex: 1, textAlign: 'right' },

  logoutBtn: {
    backgroundColor: 'rgba(251,113,133,0.08)', padding: 16,
    borderRadius: theme.radii.md, alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: theme.colors.error,
  },
  logoutText: { color: theme.colors.error, fontWeight: '800', fontSize: 15 },
});
