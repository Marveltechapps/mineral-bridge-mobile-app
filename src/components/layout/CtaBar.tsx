import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import type { ResolvedMeta } from '../../navigation/screenMeta';
import { gradients, layout, shadows } from '../../theme';
import { bg } from '../../utils/style';

type Props = {
  meta: ResolvedMeta;
  bottomInset: number;
  onPrimary: () => void;
  onSecondary: () => void;
  onAddToCart: () => void;
};

/** The bottom CTA well: one or two stacked buttons, or Add to Cart + Buy Now. */
export function CtaBar({
  meta: m,
  bottomInset,
  onPrimary,
  onSecondary,
  onAddToCart,
}: Props) {
  const well = [
    styles.well,
    bg(m.ctaWell),
    { paddingBottom: Math.max(layout.ctaWellPadding, bottomInset) },
  ];

  if (m.dualCta) {
    return (
      <View style={[well, styles.dual]}>
        <PressableScale
          onPress={onAddToCart}
          style={[styles.dualButton, styles.cartButton]}
        >
          <Icon name="cart" size={17} color="#1e2a5a" />
          <Text style={styles.cartLabel}>Add to Cart</Text>
        </PressableScale>
        <PressableScale
          onPress={onPrimary}
          style={[styles.dualButton, styles.buyButton]}
        >
          <Text style={styles.buyLabel}>Buy Now</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={well}>
      <PressableScale
        onPress={onPrimary}
        style={[
          styles.primary,
          bg(m.ctaBg),
          {
            borderRadius: m.ctaRadius,
            borderColor: m.ctaBorder,
            boxShadow: m.ctaShadow,
          },
        ]}
      >
        <Text style={[styles.primaryLabel, { color: m.ctaFg }]}>{m.cta}</Text>
      </PressableScale>
      {m.cta2 ? (
        <PressableScale
          onPress={onSecondary}
          style={[
            styles.secondary,
            {
              borderRadius: m.ctaRadius,
              backgroundColor: m.cta2Bg,
              borderColor: m.cta2Border,
            },
          ]}
        >
          <Text style={[styles.secondaryLabel, { color: m.cta2Fg }]}>
            {m.cta2}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  well: { paddingTop: 14, paddingHorizontal: 20, zIndex: 4 },
  dual: { flexDirection: 'row', gap: 10 },
  dualButton: {
    flex: 1,
    height: 58,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1e2a5a',
    flexDirection: 'row',
    gap: 8,
  },
  cartLabel: { color: '#1e2a5a', fontSize: 14, fontWeight: '600' },
  buyButton: {
    experimental_backgroundImage: gradients.navyButton,
    borderWidth: 1,
    borderColor: '#16204a',
    boxShadow: shadows.navyButton,
  },
  buyLabel: { color: '#fff', fontSize: 14.5, fontWeight: '600' },
  primary: {
    height: 58,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryLabel: { fontSize: 15, fontWeight: '600', letterSpacing: 0.1 },
  secondary: {
    height: 50,
    marginTop: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: { fontSize: 14.5, fontWeight: '600' },
});
