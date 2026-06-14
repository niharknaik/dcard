import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Snackbar, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {ProfileStackParamList} from '@/navigation/types';
import {authApi} from '@/api/auth.api';
import {apiErrorMessage} from '@/api/client';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({navigation}: Props) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const onSave = async () => {
    if (password !== confirm) {
      setSnack('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        current_password: current,
        password,
        password_confirmation: confirm,
      });
      navigation.goBack();
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <TextInput label="Current password" value={current} onChangeText={setCurrent} secureTextEntry mode="outlined" style={styles.input} />
      <TextInput label="New password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
      <TextInput label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving} style={styles.button}>
        Update password
      </Button>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {marginBottom: spacing.sm},
  button: {marginTop: spacing.sm},
});
