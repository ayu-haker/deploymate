import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPassword = useAuthStore(s => s.forgotPassword);
  const resetPassword = useAuthStore(s => s.resetPassword);

  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  const handleSendResetCode = async () => {
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your registered email address.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSending(true);
    try {
      await forgotPassword(email.trim());
      setIsSending(false);
      setStep('RESET');
      setTimer(60);
      setTimerActive(true);
      Alert.alert('Reset Code Sent 📩', `A 6-digit password reset code has been sent to ${email.trim()}. Please check your email inbox.`);
    } catch (err: any) {
      setIsSending(false);
      Alert.alert('Reset Request Failed', err.message || 'Error sending password reset code.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      Alert.alert('Code Required', 'Please enter the 6-digit verification code from your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setIsResetting(false);
      Alert.alert('Password Reset Success 🎉', 'Your password has been updated! Please sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err: any) {
      setIsResetting(false);
      Alert.alert('Reset Failed', err.message || 'Invalid or expired verification code.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.logoTitle}>🔐 DEPLOYMATE</Text>
        <Text style={styles.subTitle}>Account Recovery & Password Reset</Text>
      </View>

      <View style={styles.card}>
        {step === 'EMAIL' ? (
          <>
            <Text style={styles.cardTitle}>Forgot Password?</Text>
            <Text style={styles.cardDesc}>
              Enter your registered email address below. We will send a 6-digit verification code to reset your password.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ayushmanbosuroy@gmail.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSendResetCode} disabled={isSending}>
              {isSending ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.btnText}>Send Reset Code →</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Set New Password</Text>
            <Text style={styles.cardDesc}>
              Enter the 6-digit code sent to <Text style={{ color: '#ef4444', fontWeight: '700' }}>{email}</Text> and choose a new password.
            </Text>

            <Text style={styles.label}>6-Digit Email Code</Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min 6 characters"
              placeholderTextColor="#64748b"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              placeholderTextColor="#64748b"
              secureTextEntry
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleResetPassword} disabled={isResetting}>
              {isResetting ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.btnText}>Reset Password & Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                {timerActive ? `Resend code in ${timer}s` : "Didn't receive code?"}
              </Text>
              {!timerActive && (
                <TouchableOpacity onPress={handleSendResetCode}>
                  <Text style={styles.resendLink}> Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => setStep('EMAIL')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>← Change Email Address</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Remembered your password? <Text style={{ color: '#38bdf8', fontWeight: '700' }}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoTitle: { fontSize: 26, fontWeight: '900', color: '#ef4444', letterSpacing: 2 },
  subTitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  card: { backgroundColor: '#0f172a', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#f8fafc', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#94a3b8', lineHeight: 18, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  otpInput: { backgroundColor: '#1e293b', color: '#ef4444', padding: 14, borderRadius: 10, fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: 8, marginBottom: 16, borderWidth: 2, borderColor: '#ef4444' },
  btnPrimary: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { color: '#94a3b8', fontSize: 13 },
  resendLink: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 14 },
});
