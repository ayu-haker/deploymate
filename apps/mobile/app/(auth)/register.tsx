import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore(s => s.register);
  const sendOtp = useAuthStore(s => s.sendOtp);
  const verifyOtp = useAuthStore(s => s.verifyOtp);
  const isLoading = useAuthStore(s => s.isLoading);

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleSendOtp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Required Fields Missing', 'Please enter your Name, Email, and Password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendOtp(email.trim());
      setIsSendingOtp(false);
      setStep('OTP');
      setTimer(60);
      setTimerActive(true);

      Alert.alert('Check Your Email Inbox 📩', `A 6-digit OTP verification code has been dispatched to ${email.trim()}. Please check your Email Inbox or Spam folder.`);
    } catch (err: any) {
      setIsSendingOtp(false);
      Alert.alert('Failed to Send OTP', err.message || 'Error generating email verification code.');
    }
  };

  const handleResendOtp = async () => {
    if (timerActive) return;
    await handleSendOtp();
  };

  const handleVerifyAndRegister = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      Alert.alert('OTP Code Required', 'Please enter the 6-digit verification code sent to your email inbox.');
      return;
    }

    try {
      await verifyOtp(email.trim(), otp.trim()).catch(() => {});
      await register(email.trim(), name.trim(), password, otp.trim());
      Alert.alert('Registration Complete', 'Email verified and account created successfully!');
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.logoTitle}>DEPLOYMATE</Text>
        <Text style={styles.subTitle}>Secure Developer Registration</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.stepBadgeRow}>
          <View style={[styles.stepBadge, step === 'DETAILS' ? styles.stepActive : styles.stepDone]}>
            <Text style={styles.stepBadgeText}>1. Account Details</Text>
          </View>
          <View style={[styles.stepBadge, step === 'OTP' ? styles.stepActive : styles.stepInactive]}>
            <Text style={styles.stepBadgeText}>2. Email Inbox OTP</Text>
          </View>
        </View>

        {step === 'DETAILS' ? (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ayushman Bosu Roy"
              placeholderTextColor="#64748b"
            />

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

            <Text style={styles.label}>Password (Min 6 chars)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSendOtp} disabled={isSendingOtp}>
              {isSendingOtp ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.btnText}>Send Email OTP →</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.otpHeader}>Check Your Email Inbox</Text>
            <Text style={styles.otpSub}>
              Enter the 6-digit verification code sent to <Text style={{ color: '#38bdf8', fontWeight: '700' }}>{email}</Text>
            </Text>

            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleVerifyAndRegister} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.btnText}>Verify Email & Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                {timerActive ? `Resend code in ${timer}s` : "Didn't receive email in inbox?"}
              </Text>
              {!timerActive && (
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendLink}> Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => setStep('DETAILS')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>← Edit Account Details</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>📩 Real Email Inbox Verification & Encrypted Auth</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Already registered? <Text style={{ color: '#38bdf8', fontWeight: '700' }}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoTitle: { fontSize: 26, fontWeight: '900', color: '#38bdf8', letterSpacing: 2 },
  subTitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  card: { backgroundColor: '#0f172a', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  stepBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stepBadge: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginHorizontal: 3 },
  stepActive: { backgroundColor: '#38bdf8' },
  stepDone: { backgroundColor: '#1e293b' },
  stepInactive: { backgroundColor: '#1e293b', opacity: 0.5 },
  stepBadgeText: { fontSize: 12, fontWeight: '700', color: '#f8fafc' },
  label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  otpHeader: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 6, textAlign: 'center' },
  otpSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  otpInput: { backgroundColor: '#1e293b', color: '#38bdf8', padding: 16, borderRadius: 10, fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: 8, marginBottom: 20, borderWidth: 2, borderColor: '#38bdf8' },
  btnPrimary: { backgroundColor: '#38bdf8', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { color: '#94a3b8', fontSize: 13 },
  resendLink: { color: '#38bdf8', fontWeight: '700', fontSize: 13 },
  securityBadge: { backgroundColor: '#1e293b', padding: 10, borderRadius: 6, marginTop: 20, alignItems: 'center' },
  securityText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 14 },
});
