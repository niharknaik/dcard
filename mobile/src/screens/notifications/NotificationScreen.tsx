import React, {useCallback} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {NotificationItem} from '@/components/NotificationItem';
import {useNotificationStore} from '@/store/notification.store';
import {spacing} from '@/theme';

export function NotificationScreen() {
  const {items, loading, unreadCount, fetch, markRead, markAllRead, remove} = useNotificationStore();

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      {unreadCount > 0 ? (
        <Button onPress={markAllRead} style={styles.markAll}>
          Mark all as read
        </Button>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        refreshing={loading}
        onRefresh={fetch}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <NotificationItem
            notification={item}
            onPress={() => markRead(item.id)}
            onDelete={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyState icon="bell-outline" title="You're all caught up" subtitle="Notifications will show up here." /> : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {padding: 0},
  markAll: {alignSelf: 'flex-end', marginHorizontal: spacing.md, marginTop: spacing.sm},
  list: {padding: spacing.md, flexGrow: 1},
});
