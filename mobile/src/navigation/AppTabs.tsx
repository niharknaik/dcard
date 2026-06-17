import React, {useEffect} from 'react';
import {BottomTabBar, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppTabParamList} from './types';
import {CardsStack} from './CardsStack';
import {MarketplaceStack} from './MarketplaceStack';
import {ProfileStack} from './ProfileStack';
import {DashboardScreen} from '@/screens/dashboard/DashboardScreen';
import {LeadListScreen} from '@/screens/leads/LeadListScreen';
import {NotificationScreen} from '@/screens/notifications/NotificationScreen';
import {AdSlot} from '@/components/ads/AdSlot';
import {colors} from '@/theme';
import {useNotificationStore} from '@/store/notification.store';

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS: Record<keyof AppTabParamList, string> = {
  Dashboard: 'view-dashboard',
  Cards: 'card-account-details',
  Templates: 'palette-swatch',
  Leads: 'inbox-arrow-down',
  Notifications: 'bell',
  Profile: 'account',
};

export function AppTabs() {
  const {unreadCount, refreshUnread} = useNotificationStore();

  useEffect(() => {
    refreshUnread();
    // Poll unread count while the app is foregrounded (no push services).
    const id = setInterval(refreshUnread, 30000);
    return () => clearInterval(id);
  }, [refreshUnread]);

  return (
    <Tab.Navigator
      tabBar={props => (
        <>
          {/* App-wide ad sits just above the tab bar (free users only). */}
          <AdSlot placement="app_footer" />
          <BottomTabBar {...props} />
        </>
      )}
      screenOptions={({route}) => ({
        headerShown: false,
        // Remove the default hairline/shadow line above the tab bar.
        tabBarStyle: {borderTopWidth: 0, elevation: 0},
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({color, size}) => <Icon name={ICONS[route.name]} color={color} size={size} />,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cards" component={CardsStack} />
      <Tab.Screen name="Templates" component={MarketplaceStack} />
      <Tab.Screen name="Leads" component={LeadListScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{tabBarBadge: unreadCount > 0 ? unreadCount : undefined}}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
