import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Snackbar, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {ProfileStackParamList} from '@/navigation/types';
import {authApi} from '@/api/auth.api';
import {apiErrorMessage} from '@/api/client';
import {useAuthStore} from '@/store/auth.store';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({navigation}: Props) {
  const {user, setUser} = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const onSave = async () => {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({name: name.trim(), phone: phone.trim()});
      setUser(updated);
      navigation.goBack();
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving} style={styles.button}>
        Save
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
