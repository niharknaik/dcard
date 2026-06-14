import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {AuthStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/auth.store';
import {apiErrorMessage} from '@/api/client';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.center}>
      <Text variant="headlineMedium" style={styles.brand}>
        DCard
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in to manage your digital cards
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secure}
        mode="outlined"
        right={<TextInput.Icon icon={secure ? 'eye' : 'eye-off'} onPress={() => setSecure(!secure)} />}
        style={styles.input}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={styles.button}>
        Sign In
      </Button>

      <Button onPress={() => navigation.navigate('ForgotPassword')}>Forgot password?</Button>

      <View style={styles.footer}>
        <Text>New here? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Create an account
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {justifyContent: 'center'},
  brand: {textAlign: 'center', color: colors.primary, fontWeight: '700'},
  subtitle: {textAlign: 'center', color: colors.muted, marginBottom: spacing.lg},
  input: {marginBottom: spacing.sm},
  button: {marginTop: spacing.sm},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg},
  link: {color: colors.primary, fontWeight: '600'},
});
