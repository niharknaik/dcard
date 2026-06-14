import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Button, List, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {ProfileStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/auth.store';
import {colors, spacing} from '@/theme';
import {initials} from '@/utils/format';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen({navigation}: Props) {
  const {user, logout} = useAuthStore();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        {user?.avatar ? (
          <Avatar.Image size={72} source={{uri: user.avatar}} />
        ) : (
          <Avatar.Text size={72} label={initials(user?.name ?? 'U')} />
        )}
        <Text variant="titleLarge" style={styles.name}>
          {user?.name}
        </Text>
        <Text style={styles.muted}>{user?.email}</Text>
      </View>

      <List.Section>
        <List.Item title="Edit profile" left={p => <List.Icon {...p} icon="account-edit" />} onPress={() => navigation.navigate('EditProfile')} />
        <List.Item title="Change password" left={p => <List.Icon {...p} icon="lock-reset" />} onPress={() => navigation.navigate('ChangePassword')} />
        <List.Item title="Subscription plans" left={p => <List.Icon {...p} icon="crown" />} onPress={() => navigation.navigate('Plans')} />
        <List.Item title="Reward wallet" left={p => <List.Icon {...p} icon="wallet-giftcard" />} onPress={() => navigation.navigate('RewardWallet')} />
        <List.Item title="Refer & earn" left={p => <List.Icon {...p} icon="account-multiple-plus" />} onPress={() => navigation.navigate('Referrals')} />
        <List.Item title="Payment history" left={p => <List.Icon {...p} icon="receipt" />} onPress={() => navigation.navigate('PaymentHistory')} />
      </List.Section>

      <Button mode="outlined" textColor={colors.error} icon="logout" onPress={logout} style={styles.logout}>
        Log out
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs},
  name: {marginTop: spacing.sm, color: colors.text},
  muted: {color: colors.muted},
  logout: {marginTop: spacing.lg},
});
