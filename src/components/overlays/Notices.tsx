import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Drop, FadeIn, ease } from '../common/animations';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { IconTile } from '../common/ui';
import { openBidSheet } from '../../navigation/ctaActions';
import { navigationRef } from '../../navigation/flow';
import { useApp } from '../../context/appStore';
import { gradients, layout, shadows } from '../../theme';

/** Green confirmation toast, docked above the CTA well / tab bar. */
export function Toast() {
  const toast = useApp(s => s.toast);
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const bottom =
    104 -
    layout.ctaWellPadding +
    Math.max(layout.ctaWellPadding, insets.bottom);
  return (
    <FadeIn
      duration={200}
      easing={ease.out}
      style={[styles.toastWrap, { bottom, pointerEvents: 'none' }]}
    >
      <View
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <View style={styles.toastTick}>
          <Icon name="check" size={14} color="#fff" strokeWidth={3.5} />
        </View>
        <Text style={styles.toastText} leading={1.4}>
          {toast}
        </Text>
      </View>
    </FadeIn>
  );
}

/** "You've been outbid" in-app notification with a shortcut back to bidding. */
export function OutbidBanner() {
  const banner = useApp(s => s.banner);
  const insets = useSafeAreaInsets();
  if (!banner) return null;
  const bidAgain = () => {
    openBidSheet();
    if (
      navigationRef.isReady() &&
      navigationRef.getCurrentRoute()?.name !== 'aDetail'
    ) {
      navigationRef.dispatch(StackActions.replace('aDetail'));
    }
  };
  return (
    <Drop
      duration={280}
      easing={ease.out}
      style={[
        styles.bannerWrap,
        { top: Math.max(layout.statusBar, insets.top) + 6 },
      ]}
    >
      <PressableScale onPress={bidAgain} style={styles.banner} accessibilityRole="alert">
        <IconTile
          size={36}
          radius={9}
          bgColor={gradients.gold}
          color="#3d2c05"
          name="warning"
          iconSize={18}
          strokeWidth={2.5}
        />
        <View style={styles.flex}>
          <Text style={styles.kicker}>MINERAL BRIDGE · NOW</Text>
          <Text style={styles.bannerTitle}>
            You've been outbid on Cobalt Hydroxide
          </Text>
          <Text style={styles.bannerSub}>
            New highest bid $49,600 · 2h 14m left
          </Text>
        </View>
        <PressableScale onPress={bidAgain} style={styles.bidAgain}>
          <Text style={styles.bidAgainText}>Bid again</Text>
        </PressableScale>
      </PressableScale>
    </Drop>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toastWrap: { position: 'absolute', left: 20, right: 20, zIndex: 22 },
  toast: {
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    boxShadow: shadows.toast,
  },
  toastTick: {
    width: 24,
    height: 24,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: '#fff' },
  bannerWrap: { position: 'absolute', left: 14, right: 14, zIndex: 20 },
  banner: {
    backgroundColor: 'rgba(20,29,64,0.97)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    boxShadow: shadows.banner,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8f9dcd',
  },
  bannerTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 4 },
  bannerSub: { fontSize: 12.5, color: '#c3cbe8', marginTop: 3 },
  bidAgain: {
    alignSelf: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  bidAgainText: { color: '#1e2a5a', fontSize: 12.5, fontWeight: '600' },
});
