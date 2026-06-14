import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card as PaperCard, Text} from 'react-native-paper';
import Share from 'react-native-share';
import QRCode from 'react-native-qrcode-svg';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {CardsStackParamList} from '@/navigation/types';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<CardsStackParamList, 'QrShare'>;

export function QrShareScreen({route}: Props) {
  const {card} = route.params;
  const svgRef = useRef<{toDataURL: (cb: (data: string) => void) => void} | null>(null);

  const shareLink = async () => {
    try {
      await Share.open({
        title: card.full_name,
        message: `Check out my digital card: ${card.public_url}`,
        url: card.public_url,
      });
    } catch {
      // user cancelled
    }
  };

  const shareQr = () => {
    svgRef.current?.toDataURL(async (data: string) => {
      try {
        await Share.open({
          title: `${card.full_name} — QR`,
          url: `data:image/png;base64,${data}`,
          type: 'image/png',
          filename: `card-${card.slug}`,
        });
      } catch {
        // user cancelled
      }
    });
  };

  return (
    <ScreenContainer style={styles.center}>
      <Text variant="titleLarge" style={styles.name}>
        {card.full_name}
      </Text>
      <Text variant="bodyMedium" style={styles.url}>
        {card.public_url}
      </Text>

      <PaperCard style={styles.qrCard} mode="elevated">
        <PaperCard.Content style={styles.qrWrap}>
          <QRCode value={card.public_url} size={220} getRef={c => (svgRef.current = c)} />
        </PaperCard.Content>
      </PaperCard>

      <View style={styles.actions}>
        <Button mode="contained" icon="share-variant" onPress={shareLink}>
          Share link
        </Button>
        <Button mode="outlined" icon="qrcode" onPress={shareQr}>
          Share QR
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {alignItems: 'center', justifyContent: 'center'},
  name: {color: colors.text, fontWeight: '700'},
  url: {color: colors.muted, marginBottom: spacing.lg},
  qrCard: {backgroundColor: colors.surface, padding: spacing.sm},
  qrWrap: {alignItems: 'center', justifyContent: 'center'},
  actions: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg},
});
