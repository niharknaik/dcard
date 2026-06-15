import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Checkbox, HelperText, Text, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {AuthStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/auth.store';
import {apiErrorMessage} from '@/api/client';
import {contentApi} from '@/api/content.api';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const register = useAuthStore(s => s.register);
  const [form, setForm] = useState({name: '', email: '', phone: '', password: '', confirm: '', referralCode: ''});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(
    'I agree that DCard stores my information to create and maintain my digital card, and will not use it for any other purpose without my permission.',
  );

  useEffect(() => {
    contentApi
      .consent()
      .then(t => {
        if (t) {
          setAgreement(t);
        }
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof typeof form) => (value: string) => setForm(prev => ({...prev, [key]: value}));

  const onSubmit = async () => {
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        password_confirmation: form.confirm,
        referral_code: form.referralCode.trim() || undefined,
        accept_terms: true,
      });
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        Create your account
      </Text>

      <TextInput label="Full name" value={form.name} onChangeText={set('name')} mode="outlined" style={styles.input} />
      <TextInput
        label="Email"
        value={form.email}
        onChangeText={set('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
      />
      <TextInput label="Phone (optional)" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" mode="outlined" style={styles.input} />
      <TextInput label="Password" value={form.password} onChangeText={set('password')} secureTextEntry mode="outlined" style={styles.input} />
      <TextInput label="Confirm password" value={form.confirm} onChangeText={set('confirm')} secureTextEntry mode="outlined" style={styles.input} />
      <TextInput
        label="Referral code (optional)"
        value={form.referralCode}
        onChangeText={set('referralCode')}
        autoCapitalize="characters"
        mode="outlined"
        style={styles.input}
      />

      <Checkbox.Item
        status={consent ? 'checked' : 'unchecked'}
        onPress={() => setConsent(prev => !prev)}
        position="leading"
        labelVariant="bodySmall"
        style={styles.consent}
        label={agreement}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading || !consent} style={styles.button}>
        Sign Up
      </Button>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Sign in
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {marginBottom: spacing.md, color: colors.text},
  input: {marginBottom: spacing.sm},
  consent: {paddingHorizontal: 0, marginTop: spacing.xs},
  button: {marginTop: spacing.sm},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg},
  link: {color: colors.primary, fontWeight: '600'},
});
