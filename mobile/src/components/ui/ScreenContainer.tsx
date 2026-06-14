import React from 'react';
import {RefreshControl, ScrollView, StyleSheet, View, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing} from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
}

export function ScreenContainer({children, scroll = true, refreshing, onRefresh, style}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, style]}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  );

  return <SafeAreaView style={styles.safe} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md, flexGrow: 1},
});
