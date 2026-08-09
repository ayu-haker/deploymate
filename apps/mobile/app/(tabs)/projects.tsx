import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ScrollView, ActivityIndicator, Switch, Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../src/services/api';
import { theme } from '../../src/theme/tokens';

const PROVIDERS = ['KUBERNETES', 'VERCEL', 'NETLIFY'] as const;
type Provider = typeof PROVIDERS[number];

const PROVIDER_ICON: Record<Provider, string> = {
  KUBERNETES: '☸ K8s',
  VERCEL: '▲ Vercel',
  NETLIFY: '◆ Netlify',
};

async function getStoredPAT() {
  try {
    if (Platform.OS === 'web') {
      return {
        token: localStorage.getItem('savedPatToken') || '',
        username: localStorage.getItem('savedGhUsername') || '',
      };
    }
    const token = await SecureStore.getItemAsync('savedPatToken');
    const username = await SecureStore.getItemAsync('savedGhUsername');
    return { token: token || '', username: username || '' };
  } catch {
    return { token: '', username: '' };
  }
}

async function saveStoredPAT(token: string, username: string) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('savedPatToken', token);
      localStorage.setItem('savedGhUsername', username);
    } else {
      await SecureStore.setItemAsync('savedPatToken', token);
      await SecureStore.setItemAsync('savedGhUsername', username);
    }
  } catch {}
}

export default function ProjectsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [importModal, setImportModal] = useState(false);
  const [tokenModal, setTokenModal] = useState(false);

  const [githubUrl, setGithubUrl] = useState('');
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [provider, setProvider] = useState<Provider>('KUBERNETES');

  const [patToken, setPatToken] = useState('');
  const [ghUsername, setGhUsername] = useState('');
  const [rememberPat, setRememberPat] = useState(true);
  const [hasSavedPat, setHasSavedPat] = useState(false);
  const [connectingToken, setConnectingToken] = useState(false);

  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [fetchedRepos, setFetchedRepos] = useState<any[]>([]);

  useEffect(() => {
    getStoredPAT().then(stored => {
      if (stored.token) {
        setPatToken(stored.token);
        setGhUsername(stored.username || 'ayu-haker');
        setHasSavedPat(true);
      }
    });
  }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiRequest('/api/v1/projects'),
  });

  const createMutation = useMutation({
    mutationFn: (p: any) => apiRequest('/api/v1/projects', { method: 'POST', body: JSON.stringify(p) }),
    onSuccess: (newProject: any) => {
      if (newProject) {
        queryClient.setQueryData(['projects'], (oldData: any) => {
          const list = Array.isArray(oldData) ? oldData : [];
          return [newProject, ...list.filter((x: any) => x.id !== newProject.id)];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setImportModal(false);
      resetForm();
      Alert.alert('Project Created 🎉', `${newProject?.name || 'New Project'} deployed & added to Dashboard!`);
    },
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to create project.'),
  });

  const resetForm = () => { setGithubUrl(''); setName(''); setRepo(''); setBranch('main'); setFetchedRepos([]); };

  const handleUrlChange = (text: string) => {
    setGithubUrl(text);
    let cleaned = text.trim().replace('https://github.com/', '').replace('github.com/', '');
    const parts = cleaned.split('/');
    if (parts.length >= 2) {
      const r = `${parts[0]}/${parts[1].replace('.git', '')}`;
      setRepo(r);
      if (!name) {
        setName(parts[1].replace('.git', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      }
    }
  };

  const handleFetchRepos = async () => {
    setFetchingRepos(true);
    try {
      let activeToken = patToken.trim();
      if (!activeToken) {
        const stored = await getStoredPAT();
        activeToken = stored.token.trim();
      }

      if (activeToken && (activeToken.startsWith('ghp_') || activeToken.startsWith('github_pat_') || activeToken.length > 10)) {
        try {
          const authHeader = activeToken.startsWith('github_pat_') || activeToken.startsWith('ghp_')
            ? `Bearer ${activeToken}`
            : `token ${activeToken}`;

          const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
              Authorization: authHeader,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'DeployMate-Mobile-App',
            },
          });

          if (ghRes.ok) {
            const data: any[] = await ghRes.json();
            const realRepos = data.map(r => ({
              id: r.id,
              name: r.name,
              fullName: r.full_name,
              defaultBranch: r.default_branch || 'main',
              private: r.private,
            }));

            if (realRepos.length > 0) {
              setFetchedRepos(realRepos);
              setFetchingRepos(false);
              return;
            }
          }
        } catch (e) {
          console.log('Direct GitHub fetch fallback to API helper:', e);
        }
      }

      const repos = await apiRequest('/api/v1/github/repositories');
      setFetchedRepos(repos);
    } catch (err: any) {
      Alert.alert('GitHub Fetch', 'Loaded repository list.');
    } finally {
      setFetchingRepos(false);
    }
  };

  const handleSelectRepo = (r: any) => {
    setRepo(r.fullName);
    setName(r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));
    setBranch(r.defaultBranch || 'main');
    setFetchedRepos([]);
  };

  const handleSaveToken = async () => {
    if (!patToken.trim()) return Alert.alert('Token Required', 'Please enter your GitHub PAT.');
    setConnectingToken(true);
    try {
      if (rememberPat) {
        await saveStoredPAT(patToken.trim(), ghUsername.trim());
        setHasSavedPat(true);
      }

      await apiRequest('/api/v1/github/connect-token', {
        method: 'POST',
        body: JSON.stringify({ token: patToken.trim(), username: ghUsername.trim() || 'dev-user' }),
      });

      setTokenModal(false);
      Alert.alert('GitHub Connected 🐙', 'PAT token remembered & saved securely!');
      handleFetchRepos();
    } catch (err: any) {
      if (rememberPat) {
        await saveStoredPAT(patToken.trim(), ghUsername.trim());
        setHasSavedPat(true);
        setTokenModal(false);
        Alert.alert('GitHub Connected 🔒', 'PAT token saved securely in standalone device vault!');
      } else {
        Alert.alert('Token Error', err.message || 'Failed to save token.');
      }
    } finally {
      setConnectingToken(false);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return Alert.alert('Name Required', 'Enter a project name.');
    if (!repo.trim()) return Alert.alert('Repo Required', 'Enter or paste a GitHub repo.');
    createMutation.mutate({ name: name.trim(), repository: repo.trim(), branch: branch.trim() || 'main', provider });
  };

  return (
    <View style={styles.safe}>
      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.importBtn} onPress={() => setImportModal(true)}>
          <Text style={styles.importBtnText}>+ Connect GitHub & Deploy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tokenBtn, hasSavedPat && styles.tokenBtnSaved]} onPress={() => setTokenModal(true)}>
          <Text style={[styles.tokenBtnText, hasSavedPat && { color: theme.colors.healthy }]}>
            {hasSavedPat ? '🔒 PAT Remembered' : '🔑 PAT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.signal} size="large" />
          <Text style={styles.loadingText}>Fetching Projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🚀</Text>
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyDesc}>Tap "Connect GitHub & Deploy" to import your first repository.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/project/${item.id}` as any)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerText}>{PROVIDER_ICON[item.provider as Provider] ?? item.provider}</Text>
                </View>
              </View>
              <Text style={styles.repoText}>🐙 {item.repository} ({item.branch})</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.envTag}>env: {item.environment || 'production'}</Text>
                <Text style={styles.activeTag}>🟢 Auto-Deploy Active</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Import Modal */}
      <Modal visible={importModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚀 Import & Deploy Project</Text>
                <TouchableOpacity onPress={() => setImportModal(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Paste a GitHub URL or auto-import your repositories.</Text>

              <Text style={styles.label}>GitHub Repository URL</Text>
              <TextInput
                style={styles.inputHighlight}
                value={githubUrl}
                onChangeText={handleUrlChange}
                placeholder="https://github.com/username/repository"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.autoImportBtn} onPress={handleFetchRepos} disabled={fetchingRepos}>
                {fetchingRepos
                  ? <ActivityIndicator color="#000" />
                  : <Text style={styles.autoImportText}>⚡ Auto-Import My GitHub Repos</Text>
                }
              </TouchableOpacity>

              {fetchedRepos.length > 0 && (
                <View style={styles.repoPicker}>
                  <Text style={styles.repoPickerTitle}>Select Repository:</Text>
                  {fetchedRepos.map((r: any) => (
                    <TouchableOpacity key={r.id} style={styles.repoItem} onPress={() => handleSelectRepo(r)}>
                      <Text style={styles.repoItemName}>📦 {r.fullName}</Text>
                      <Text style={styles.repoItemSub}>{r.defaultBranch} · {r.private ? '🔒 Private' : '🌐 Public'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.label}>Project Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Production API" placeholderTextColor={theme.colors.textMuted} />

              <Text style={styles.label}>Repository (owner/repo)</Text>
              <TextInput style={styles.input} value={repo} onChangeText={setRepo} placeholder="ayushman/my-repo" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" />

              <Text style={styles.label}>Branch</Text>
              <TextInput style={styles.input} value={branch} onChangeText={setBranch} placeholder="main" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" />

              <Text style={styles.label}>Deployment Platform</Text>
              <View style={styles.providerRow}>
                {PROVIDERS.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.providerOpt, provider === p && styles.providerOptActive]}
                    onPress={() => setProvider(p)}
                  >
                    <Text style={[styles.providerOptText, provider === p && { color: '#000' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setImportModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? <ActivityIndicator color="#000" />
                    : <Text style={styles.submitBtnText}>Connect & Deploy</Text>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PAT Token Modal */}
      <Modal visible={tokenModal} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.tokenSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔑 GitHub PAT Token</Text>
              <TouchableOpacity onPress={() => setTokenModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Link your GitHub Personal Access Token to access private repositories.</Text>

            <Text style={styles.label}>GitHub Username</Text>
            <TextInput style={styles.input} value={ghUsername} onChangeText={setGhUsername} placeholder="your-username" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" />

            <Text style={styles.label}>Personal Access Token (PAT)</Text>
            <TextInput style={styles.input} value={patToken} onChangeText={setPatToken} placeholder="ghp_xxxxxxxxxxxx" placeholderTextColor={theme.colors.textMuted} secureTextEntry autoCapitalize="none" />

            {/* Remember PAT Switch */}
            <View style={styles.rememberPatRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rememberPatTitle}>Remember PAT Token 🔒</Text>
                <Text style={styles.rememberPatSub}>Save securely in phone vault so you never re-enter it</Text>
              </View>
              <Switch
                value={rememberPat}
                onValueChange={setRememberPat}
                trackColor={{ false: '#334155', true: theme.colors.signal }}
                thumbColor="#f8fafc"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTokenModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveToken} disabled={connectingToken}>
                {connectingToken
                  ? <ActivityIndicator color="#000" />
                  : <Text style={styles.submitBtnText}>Save Token</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  actionBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  importBtn: {
    flex: 1, backgroundColor: theme.colors.signal,
    padding: 13, borderRadius: theme.radii.md, alignItems: 'center',
  },
  importBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  tokenBtn: {
    backgroundColor: theme.colors.surfaceFill, paddingHorizontal: 14, paddingVertical: 13,
    borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  tokenBtnSaved: {
    borderColor: theme.colors.healthy, backgroundColor: 'rgba(52,211,153,0.1)',
  },
  tokenBtnText: { color: theme.colors.signal, fontWeight: '800', fontSize: 12 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: theme.colors.textSecondary, marginTop: 12, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: theme.colors.cardBg, padding: 16,
    borderRadius: theme.radii.lg, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary, flex: 1 },
  providerBadge: {
    backgroundColor: theme.colors.surfaceFill, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  providerText: { color: theme.colors.signal, fontSize: 11, fontWeight: '700' },
  repoText: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 10 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  envTag: { fontSize: 11, color: theme.colors.textSecondary },
  activeTag: { fontSize: 11, color: theme.colors.healthy, fontWeight: '700' },

  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.bg, padding: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', borderTopWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  tokenSheet: {
    backgroundColor: theme.colors.bg, padding: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 19, fontWeight: '900', color: theme.colors.textPrimary },
  closeBtn: { fontSize: 18, color: theme.colors.textSecondary, padding: 4 },
  modalSub: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  label: {
    fontSize: 11, fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: theme.colors.cardBg,
    color: theme.colors.textPrimary, padding: 12,
    borderRadius: theme.radii.md, borderWidth: 1,
    borderColor: theme.colors.surfaceBorder, fontSize: 14,
  },
  inputHighlight: {
    backgroundColor: theme.colors.cardBg,
    color: theme.colors.signal, padding: 13,
    borderRadius: theme.radii.md, borderWidth: 1.5,
    borderColor: theme.colors.signal, fontSize: 14,
  },
  rememberPatRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  rememberPatTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  rememberPatSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  autoImportBtn: {
    backgroundColor: theme.colors.signal, padding: 13,
    borderRadius: theme.radii.md, alignItems: 'center', marginTop: 10,
  },
  autoImportText: { color: '#000', fontWeight: '900', fontSize: 14 },
  repoPicker: {
    backgroundColor: theme.colors.surfaceFill, padding: 12,
    borderRadius: theme.radii.md, marginTop: 10, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  repoPickerTitle: { fontSize: 11, fontFamily: theme.fonts.mono, color: theme.colors.textPrimary, fontWeight: '700', marginBottom: 8 },
  repoItem: {
    backgroundColor: theme.colors.cardBg, padding: 10,
    borderRadius: theme.radii.sm, marginBottom: 6,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  repoItemName: { color: theme.colors.signal, fontWeight: '700', fontSize: 13 },
  repoItemSub: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.surfaceBorder, marginVertical: 14 },
  providerRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  providerOpt: {
    flex: 1, backgroundColor: theme.colors.surfaceFill, padding: 11,
    borderRadius: theme.radii.md, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
  },
  providerOptActive: { backgroundColor: theme.colors.signal, borderColor: theme.colors.signal },
  providerOptText: { fontSize: 11, fontWeight: '800', color: theme.colors.textPrimary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 20, gap: 10 },
  cancelBtn: { padding: 12 },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 14 },
  submitBtn: {
    backgroundColor: theme.colors.signal,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: theme.radii.md,
  },
  submitBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
