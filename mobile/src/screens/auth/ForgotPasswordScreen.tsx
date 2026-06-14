import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {AuthStackParamList} from '@/navigation/types';
import {authApi} from '@/api/auth.api';
import {apiErrorMessage} from '@/api/client';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const msg = await authApi.forgotPassword(email.trim());
      setMessage(msg || 'If that email exists, a reset link has been sent.');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.center}>
      <Text variant="headlineSmall" style={styles.title}>
        Reset password
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter your email and we'll send a reset link.
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

      {error ? <HelperText type="error">{error}</HelperText> : null}
      {message ? <HelperText type="info">{message}</HelperText> : null}

      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={styles.button}>
        Send reset link
      </Button>
      <Button onPress={() => navigation.goBack()}>Back to sign in</Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {justifyContent: 'center'},
  title: {textAlign: 'center', color: colors.text},
  subtitle: {textAlign: 'center', color: colors.muted, marginBottom: spacing.lg},
  input: {marginBottom: spacing.sm},
  button: {marginTop: spacing.sm},
});
