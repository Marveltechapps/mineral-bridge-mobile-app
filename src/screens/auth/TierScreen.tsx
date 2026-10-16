import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { IconTile, Pill, RadioDot } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { setAppState, useApp } from '../../context/appStore';

/** A1 · Account tier — a tag on the account; everyone can buy and sell. */
export function TierScreen() {
  const tierIdx = useApp(s => s.tierIdx);
  return (
    <ScreenContainer screen="tier" contentStyle={styles.content}>
      <Text style={styles.title} leading={1.2}>
        {'Which best\ndescribes you?'}
      </Text>
      <Text style={styles.sub} leading={1.55}>
        This is a tag on your account, not a limit. Everyone can buy and sell —
        your tier only sets how much paperwork we ask for.
      </Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {ACCOUNT_TIERS.map((t, i) => {
          const on = tierIdx === i;
          return (
            <PressableScale
              key={t.tag}
              activeScale={0.985}
              onPress={() => setAppState({ tierIdx: i })}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[
                styles.card,
                {
                  borderColor: on ? '#1e2a5a' : '#e5e7ec',
                  boxShadow: on
                    ? '0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(30,42,90,0.16)'
                    : '0 1px 2px rgba(16,24,40,0.05)',
                },
              ]}
            >
              <IconTile
                size={44}
                radius={12}
                bgColor={t.iconBg}
                color={t.iconFg}
                d={t.icon}
                iconSize={21}
              />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Pill
                    label={t.tag}
                    bgColor={t.tagBg}
                    border={t.tagBorder}
                    fg={t.tagFg}
                    size={9}
                    weight="700"
                    spacing={0.5}
                    padH={7}
                  />
                </View>
                <Text style={styles.tierSub} leading={1.45}>
                  {t.sub}
                </Text>
              </View>
              <RadioDot
                dot={on ? '#1e2a5a' : '#c9cdd8'}
                fill={on ? '#1e2a5a' : 'transparent'}
              />
            </PressableScale>
          );
        })}
      </View>
      <View style={styles.hint}>
        <Icon name="info" size={18} color="#f3d27a" />
        <Text style={styles.hintText} leading={1.5}>
          {ACCOUNT_TIERS[tierIdx].hint}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingHorizontal: 22, paddingBottom: 30 },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.6,
  },
  sub: { fontSize: 13.5, color: '#c3cbe8', marginTop: 9 },
  list: { marginTop: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  flex: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36', flexShrink: 1 },
  tierSub: { fontSize: 12.5, color: '#6b7290', marginTop: 4 },
  hint: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 11,
  },
  hintText: { flex: 1, fontSize: 12.5, color: '#c3cbe8' },
});
