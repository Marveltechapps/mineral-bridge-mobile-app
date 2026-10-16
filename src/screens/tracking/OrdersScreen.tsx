import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Photo, SegmentTabs } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ORDERS, SELL_REQUESTS, type Order } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import { setAppState, useApp, type AppState } from '../../context/appStore';
import { shadows } from '../../theme';
import { bg } from '../../utils/style';

const TONE = {
  done: { pillBg: '#edf7f1', pillFg: '#15803d', bar: '#16a34a' },
  warn: {
    pillBg: '#fbf3e4',
    pillFg: '#a1620b',
    bar: 'linear-gradient(90deg,#1e2a5a,#3b6fd4)',
  },
  gold: {
    pillBg: '#f8f2e3',
    pillFg: '#8a6a1c',
    bar: 'linear-gradient(90deg,#f7dd8e,#c8962f)',
  },
  live: {
    pillBg: '#f1f3f7',
    pillFg: '#33406e',
    bar: 'linear-gradient(90deg,#1e2a5a,#3b6fd4)',
  },
} as const;

type Tab = AppState['orderTab'];

/** T1 · My orders — buying, selling and completed, each with stage progress. */
export function OrdersScreen() {
  const orderTab = useApp(s => s.orderTab);
  const list: Order[] =
    orderTab === 'selling'
      ? SELL_REQUESTS
      : ORDERS.filter(o =>
          orderTab === 'completed' ? o.tone === 'done' : o.tone !== 'done',
        );
  const tabs: { id: Tab; label: string; count: string }[] = [
    {
      id: 'active',
      label: 'Buying',
      count: String(ORDERS.filter(o => o.tone !== 'done').length),
    },
    { id: 'selling', label: 'Selling', count: String(SELL_REQUESTS.length) },
    {
      id: 'completed',
      label: 'Completed',
      count: String(ORDERS.filter(o => o.tone === 'done').length),
    },
  ];
  const open = (idx: number) => {
    if (orderTab === 'selling') {
      setAppState({ reqIdx: idx });
      go('sTrack');
    } else go('track');
  };

  return (
    <ScreenContainer screen="orders" contentStyle={styles.content}>
      <SegmentTabs
        tabs={tabs}
        value={orderTab}
        onChange={id => setAppState({ orderTab: id })}
        spacing={22}
      />
      <View style={styles.list}>
        {list.map((o, idx) => {
          const t = TONE[o.tone];
          return (
            <PressableScale
              key={o.id}
              onPress={() => open(idx)}
              style={styles.card}
            >
              <View style={styles.top}>
                <Photo name={o.img} style={styles.thumb} />
                <View style={styles.flex}>
                  <View style={styles.idRow}>
                    <Text style={styles.id}>{o.id}</Text>
                    <View style={[styles.pill, { backgroundColor: t.pillBg }]}>
                      <Text style={[styles.pillText, { color: t.pillFg }]}>
                        {o.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.name}>{o.name}</Text>
                  <Text style={styles.qty}>{o.qty + ' · ' + o.value}</Text>
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      bg(t.bar),
                      { width: o.progress as `${number}%` },
                    ]}
                  />
                </View>
                <Text style={styles.stage}>{o.stage}</Text>
              </View>
              <Text style={styles.eta}>{o.eta}</Text>
            </PressableScale>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 4, paddingBottom: 26 },
  list: { paddingTop: 16, paddingHorizontal: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 14,
    boxShadow: shadows.card,
  },
  top: { flexDirection: 'row', gap: 13, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 11 },
  flex: { flex: 1 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  id: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: '#8890ad' },
  pill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 9999 },
  pillText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7 },
  name: { fontSize: 15, fontWeight: '600', color: '#1a1f36', marginTop: 4 },
  qty: { fontSize: 12.5, color: '#6b7290', marginTop: 2 },
  progressRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f2f6',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 9999 },
  stage: { fontSize: 11.5, fontWeight: '600', color: '#6b7290' },
  eta: { marginTop: 10, fontSize: 12, color: '#8890ad', fontWeight: '600' },
});
