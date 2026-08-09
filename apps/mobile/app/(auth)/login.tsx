import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { theme } from '../../src/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const rememberMe = useAuthStore(s => s.rememberMe);
  const setRememberMe = useAuthStore(s => s.setRememberMe);

  const [email, setEmail] = useState('ayushmanbosuroy@gmail.com');
  const [password, setPassword] = useState('SecureP@ssw0rd!');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Validation Error', 'Please enter both your email address and password.');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Check your credentials and try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerBox}>
        <Text style={styles.brandTitle}>🚀 DeployMate</Text>
        <Text style={styles.tagline}>One app to deploy, monitor, debug & fix applications across Kubernetes, Vercel & Netlify.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="dev@deploymate.io"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry={!showPassword}
        />

        {/* Remember Sign In Toggle */}
        <View style={styles.rememberRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rememberTitle}>Remember Sign In 🔒</Text>
            <Text style={styles.rememberSub}>Stay logged in permanently on this device</Text>
          </View>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#334155', true: '#38bdf8' }}
            thumbColor="#f8fafc"
          />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.btnText}>Authenticate & Launch</Text>
          )}
        </TouchableOpacity>

        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>🛡️ 2-Factor OTP Safety & JWT Token Encryption</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Don't have an account? <Text style={{ color: '#38bdf8', fontWeight: '700' }}>Register with OTP</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 20 },
  headerBox: { marginBottom: 24, alignItems: 'center' },
  brandTitle: { fontSize: 32, fontWeight: '900', color: '#38bdf8', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 8, paddingHorizontal: 12, lineHeight: 18 },
  card: { backgroundColor: '#0f172a', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' },
  toggleText: { fontSize: 12, color: '#38bdf8', fontWeight: '700' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 13, borderRadius: 8, fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  rememberTitle: { fontSize: 13, fontWeight: '700', color: '#f8fafc' },
  rememberSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 14, marginTop: 4 },
  forgotText: { color: '#ef4444', fontSize: 13, fontWeight: '700' },
  btnPrimary: { backgroundColor: '#38bdf8', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#0f172a', fontWeight: '800', fontSize: 15 },
  securityBadge: { backgroundColor: '#1e293b', padding: 10, borderRadius: 6, marginTop: 16, alignItems: 'center' },
  securityText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 14 },
});
