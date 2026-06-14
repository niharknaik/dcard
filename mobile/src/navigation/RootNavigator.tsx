import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthStack} from './AuthStack';
import {AppTabs} from './AppTabs';
import {LoadingView} from '@/components/ui/LoadingView';
import {useAuthStore} from '@/store/auth.store';

export function RootNavigator() {
  const {status, bootstrap} = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === 'loading') {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      {status === 'authenticated' ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
