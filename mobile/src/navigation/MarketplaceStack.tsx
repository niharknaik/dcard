import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MarketplaceStackParamList} from './types';
import {TemplateMarketplaceScreen} from '@/screens/templates/TemplateMarketplaceScreen';
import {TemplateDetailScreen} from '@/screens/templates/TemplateDetailScreen';
import {colors} from '@/theme';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export function MarketplaceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: {backgroundColor: colors.surface},
      }}>
      <Stack.Screen
        name="TemplateMarketplace"
        component={TemplateMarketplaceScreen}
        options={{title: 'Templates'}}
      />
      <Stack.Screen
        name="TemplateDetail"
        component={TemplateDetailScreen}
        options={{title: 'Template'}}
      />
    </Stack.Navigator>
  );
}
