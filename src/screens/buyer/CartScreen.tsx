import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FadeUp, ease } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import { InfoNote, Photo, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { ImageName } from '../../../assets/images';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { dollars } from '../../utils/format';

type Line = {
  key: 'cartA' | 'cartB';
  name: string;
  spec: string;
  img: ImageName;
  rate: number;
  delay: number;
};
const LINES: Line[] = [
  {
    key: 'cartA',
    name: 'Gold Doré Bar · 22K',
    spec: '$61.40 / g · Osun State',
    img: 'gold-dore',
    rate: 61.4,
    delay: 50,
  },
  {
    key: 'cartB',
    name: 'Gold Grain / Shot',
    spec: '$63.20 / g · Lagos vault',
    img: 'grain-shot',
    rate: 63.2,
    delay: 120,
  },
];

/** B3a · Cart — line items with kg steppers and an indicative total. */
export function CartScreen() {
  const cart = useApp(s => ({ cartA: s.cartA, cartB: s.cartB }));
  const sub = cart.cartA * 1000 * 61.4 + cart.cartB * 1000 * 63.2;
  const totals = [
    { k: 'Subtotal', v: dollars(sub), fg: '#1a1f36' },
    { k: 'Assay and handling', v: dollars(sub * 0.018), fg: '#1a1f36' },
    { k: 'Bonded transport', v: 'Quoted after assay', fg: '#8890ad' },
  ];
  return (
    <ScreenContainer screen="cart" contentStyle={styles.content}>
      <View style={styles.items}>
        {LINES.map(c => {
          const q = cart[c.key];
          return (
            <FadeUp
              key={c.key}
              duration={500}
              delay={c.delay}
              easing={ease.out}
              style={styles.item}
            >
              <Photo name={c.img} style={styles.thumb} />
              <View style={styles.flex}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.spec}>{c.spec}</Text>
                <View style={styles.row}>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() =>
                        setAppState(p => ({
                          [c.key]: Math.max(5, p[c.key] - 5),
                        }))
                      }
                      style={styles.dec}
                      accessibilityLabel={`Decrease ${c.name}`}
                    >
                      <Icon
                        name="minus"
                        size={13}
                        color="#1e2a5a"
                        strokeWidth={2.6}
                      />
                    </Pressable>
                    <Text style={styles.qty}>{q + ' kg'}</Text>
                    <Pressable
                      onPress={() =>
                        setAppState(p => ({ [c.key]: p[c.key] + 5 }))
                      }
                      style={styles.inc}
                      accessibilityLabel={`Increase ${c.name}`}
                    >
                      <Icon
                        name="plus"
                        size={13}
                        color="#fff"
                        strokeWidth={2.6}
                      />
                    </Pressable>
                  </View>
                  <GradientText style={styles.lineTotal}>
                    {dollars(q * 1000 * c.rate)}
                  </GradientText>
                </View>
              </View>
            </FadeUp>
          );
        })}
      </View>
      <View style={styles.totals}>
        {totals.map(r => (
          <View key={r.k} style={styles.totalRow}>
            <Text style={[styles.totalKey, { color: r.fg }]}>{r.k}</Text>
            <Text style={[styles.totalValue, { color: r.fg }]}>{r.v}</Text>
          </View>
        ))}
        <View style={styles.grand}>
          <SectionLabel>TOTAL</SectionLabel>
          <GradientText style={styles.grandValue}>
            {dollars(sub * 1.018)}
          </GradientText>
        </View>
      </View>
      <InfoNote style={styles.note}>
        No payment is taken now. A verified quote with final assay weight
        arrives within 48 hours.
      </InfoNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  items: { gap: 11 },
  item: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    gap: 13,
    boxShadow: shadows.xs,
  },
  thumb: { width: 64, height: 64, borderRadius: 11 },
  flex: { flex: 1 },
  name: { fontSize: 14.5, fontWeight: '600', color: '#1a1f36' },
  spec: { fontSize: 12, color: '#8890ad', marginTop: 3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dec: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inc: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#1e2a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1f36',
    minWidth: 44,
    textAlign: 'center',
  },
  lineTotal: { fontSize: 15, fontWeight: '700' },
  totals: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  totalRow: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  totalKey: { fontSize: 13, fontWeight: '500' },
  totalValue: { fontSize: 13.5, fontWeight: '600' },
  grand: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grandValue: { fontSize: 21, fontWeight: '700', letterSpacing: -0.5 },
  note: { marginTop: 14 },
});
