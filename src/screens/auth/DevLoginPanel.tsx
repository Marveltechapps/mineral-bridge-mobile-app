import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { fetchDevLoginStatus, isDemoMode, startDevLogin, verifyDevLogin } from '../../api/auth';
import { getAccessToken, getRefreshToken, saveSignIn } from '../../api/session';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { setAppState } from '../../context/appStore';
import { go } from '../../navigation/flow';
import { devLoginUiAllowed } from './devLoginAccess';

/** Local development sign-in. Hidden in release builds and until the backend allows it. */
export function DevLoginPanel({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const devBuild = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [developmentOtp, setDevelopmentOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!devBuild || isDemoMode()) return;
    let cancelled = false;
    fetchDevLoginStatus()
      .then((status) => {
        if (!cancelled) setEnabled(status.enabled === true);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [devBuild]);

  useEffect(() => () => {
    setPassword('');
    setDevelopmentOtp(null);
  }, []);

  if (!devLoginUiAllowed(devBuild, enabled)) return null;

  const fail = (err: unknown, fallback: string) => {
    setBusy(false);
    setError(err instanceof Error ? err.message : fallback);
  };

  const close = () => {
    setExpanded(false);
    setPassword('');
    setCode('');
    setDevelopmentOtp(null);
    setError(null);
    onOpenChange?.(false);
  };

  const submitCredentials = () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    const currentPassword = password;
    setPassword('');
    startDevLogin(email.trim(), currentPassword)
      .then((challenge) => {
        if (!challenge.developmentOtp) {
          setError('The server did not return a development code');
          return;
        }
        setDevelopmentOtp(challenge.developmentOtp);
        setCode('');
        onOpenChange?.(true);
      })
      .catch((err: unknown) => fail(err, 'Development login is not available'))
      .finally(() => setBusy(false));
  };

  const submitCode = () => {
    if (busy) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit development code');
      return;
    }
    setBusy(true);
    setError(null);
    verifyDevLogin(code)
      .then((info) => {
        setDevelopmentOtp(null);
        setPassword('');
        setCode('');
        setAppState({
          authMode: 'login',
          signedIn: true,
          sampleOrders: false,
          guest: false,
          onboardingNext: info.nextStep,
          kyc: info.kyc,
          displayName: 'Development operator',
        });
        saveSignIn({
          demo: false,
          accessToken: getAccessToken() ?? '',
          refreshToken: getRefreshToken() ?? '',
          phone: '',
          kyc: info.kyc,
          onboardingNext: info.nextStep,
          displayName: 'Development operator',
          authMode: 'login',
        }).catch(() => undefined);
        go('verifying');
      })
      .catch((err: unknown) => fail(err, 'That code was not accepted'));
  };

  return (
    <View style={styles.wrap}>
      {!expanded ? (
        <PressableScale
          onPress={() => setExpanded(true)}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Developer login</Text>
        </PressableScale>
      ) : !developmentOtp ? (
        <>
          <Text style={styles.label}>DEVELOPER LOGIN</Text>
          <Text style={styles.note}>Local development only. A code appears here after the server accepts the password.</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Developer email"
            placeholderTextColor="#8890ad"
            style={styles.input}
            accessibilityLabel="Developer email"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Development password"
            placeholderTextColor="#8890ad"
            style={styles.input}
            accessibilityLabel="Developer password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PressableScale onPress={submitCredentials} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{busy ? 'Checking…' : 'Continue'}</Text>
          </PressableScale>
          <PressableScale onPress={close} accessibilityRole="button">
            <Text style={styles.back}>Use customer login</Text>
          </PressableScale>
        </>
      ) : (
        <>
          <Text style={styles.label}>DEVELOPMENT CODE</Text>
          <Text style={styles.code}>{developmentOtp}</Text>
          <Text style={styles.note}>Enter that code to finish signing in. It is not sent by SMS.</Text>
          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="6-digit code"
            placeholderTextColor="#8890ad"
            style={styles.input}
            accessibilityLabel="Development code"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PressableScale onPress={submitCode} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{busy ? 'Verifying…' : 'Verify and continue'}</Text>
          </PressableScale>
          <PressableScale onPress={close} accessibilityRole="button">
            <Text style={styles.back}>Back</Text>
          </PressableScale>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18, gap: 8 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: '#d7deef' },
  note: { fontSize: 12.5, color: '#c3cbe8', lineHeight: 18 },
  input: {
    height: 48,
    borderRadius: 11,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1a1f36',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3d27a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '800', color: '#1a1f36' },
  code: { fontSize: 28, fontWeight: '800', letterSpacing: 4, color: '#f3d27a' },
  error: { color: '#ffb4b4', fontSize: 13 },
  back: { color: '#d7deef', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },
});
