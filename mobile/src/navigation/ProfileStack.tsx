import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileStackParamList} from './types';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import {EditProfileScreen} from '@/screens/profile/EditProfileScreen';
import {ChangePasswordScreen} from '@/screens/profile/ChangePasswordScreen';
import {PlansScreen} from '@/screens/profile/PlansScreen';
import {PaymentHistoryScreen} from '@/screens/profile/PaymentHistoryScreen';
import {RewardWalletScreen} from '@/screens/rewards/RewardWalletScreen';
import {ReferralScreen} from '@/screens/referrals/ReferralScreen';
import {colors} from '@/theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: {backgroundColor: colors.surface},
      }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{title: 'Profile'}} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title: 'Edit Profile'}} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{title: 'Change Password'}} />
      <Stack.Screen name="Plans" component={PlansScreen} options={{title: 'Plans'}} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{title: 'Payment History'}} />
      <Stack.Screen name="RewardWallet" component={RewardWalletScreen} options={{title: 'Reward Wallet'}} />
      <Stack.Screen name="Referrals" component={ReferralScreen} options={{title: 'Refer & Earn'}} />
    </Stack.Navigator>
  );
}
