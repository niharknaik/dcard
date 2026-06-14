import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CardsStackParamList} from './types';
import {CardListScreen} from '@/screens/cards/CardListScreen';
import {CardEditorScreen} from '@/screens/cards/CardEditorScreen';
import {QrShareScreen} from '@/screens/cards/QrShareScreen';
import {colors} from '@/theme';

const Stack = createNativeStackNavigator<CardsStackParamList>();

export function CardsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: {backgroundColor: colors.surface},
      }}>
      <Stack.Screen name="CardList" component={CardListScreen} options={{title: 'My Cards'}} />
      <Stack.Screen name="CardEditor" component={CardEditorScreen} options={{title: 'Card'}} />
      <Stack.Screen name="QrShare" component={QrShareScreen} options={{title: 'Share Card'}} />
    </Stack.Navigator>
  );
}
