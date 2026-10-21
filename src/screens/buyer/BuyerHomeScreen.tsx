import React from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Drop } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  Grid,
  IconTile,
  Photo,
  Scrim,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { matchesQuery } from '../../catalog/gridFilter';
import { useBuyerCatalog } from '../../catalog/useBuyerCatalog';
import { PRODUCTS } from '../../lib/catalog';
import { go, jump } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { shrink } from '../../utils/style';
import { gradients, shadows } from '../../theme';

const QUICK = [
  {
    label: 'Auctions',
    icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
    bg: '#f8f2e3',
    fg: '#8a6a1c',
    count: '',
    to: 'aList' as const,
  },
  {
    label: 'Learning Center',
    icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 5.5V21h16',
    bg: '#eef3fe',
    fg: '#1d4fd7',
    count: '',
    to: 'lHome' as const,
  },
  {
    label: 'My Orders',
    icon: 'M6 2h12l2 5H4zM4 7v13h16V7M9 11h6',
    bg: '#ecf7f0',
    fg: '#15803d',
    count: '2',
    to: 'orders' as const,
  },
  {
    label: 'Notifications',
    icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0',
    bg: '#f1f3f7',
    fg: '#33406e',
    count: '3',
    to: 'notifs' as const,
  },
];

/** B1 · Buyer home — KYC nudge, verified-supply hero, shortcuts and categories. */
export function BuyerHomeScreen() {
  const { guest, kyc, browseQuery, displayName } = useApp(s => ({
    guest: s.guest,
    kyc: s.kyc,
    browseQuery: s.browseQuery,
    displayName: s.displayName,
  }));
  const catalog = useBuyerCatalog();
  const pending = kyc === 'pending';
  const startKyc = () => {
    setAppState({ sheet: null });
    go('kycStart');
  };
  const guestSignup = () => {
    setAppState({
      guest: false,
      authMode: 'signup',
      phone: '',
      code: '',
      sheet: null,
    });
    jump('signupPhone');
  };

  return (
    <ScreenContainer screen="bHome" contentStyle={styles.content}>
      {!guest && kyc !== 'verified' ? (
        <Drop>
          <Pressable
            onPress={startKyc}
            style={styles.nudge}
            accessibilityRole="button"
          >
            <IconTile
              size={36}
              radius={10}
              bgColor={pending ? '#fbf3e4' : '#f1f3f7'}
              color={pending ? '#a1620b' : '#33406e'}
              name="shield"
              iconSize={17}
            />
            <View style={styles.flex}>
              <Text style={styles.nudgeTitle}>
                {pending
                  ? 'Identity check in review'
                  : 'Finish your identity check'}
              </Text>
              <Text style={styles.nudgeSub} leading={1.4}>
                {pending
                  ? 'Usually clears within 2 hours. Browsing stays open.'
                  : 'Needed before you can order, list or bid.'}
              </Text>
            </View>
            <Text style={styles.nudgeLink}>
              {pending ? 'Status' : 'Verify'}
            </Text>
          </Pressable>
        </Drop>
      ) : null}
      {guest ? (
        <Drop style={styles.guest}>
          <View style={styles.guestIcon}>
            <Icon name="eye" size={17} color="#a1620b" strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.guestTitle}>Guest mode</Text>
            <Text style={styles.guestSub} leading={1.4}>
              Browse everything. Sign in to order, list or bid.
            </Text>
          </View>
          <Pressable
            onPress={guestSignup}
            style={styles.signIn}
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        </Drop>
      ) : null}

      <View style={styles.greeting}>
        <View style={shrink}>
          <Text style={styles.hello}>Good morning</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <Pressable
          onPress={() => go('notifs')}
          style={styles.bell}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Icon name="bell" size={19} color="#1e2a5a" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Icon name="search" size={18} color="#8890ad" />
        <TextInput
          value={browseQuery}
          onChangeText={text => setAppState({ browseQuery: text })}
          placeholder="Search gold, cobalt, lithium…"
          placeholderTextColor="#8890ad"
          style={styles.searchText}
          accessibilityLabel="Search minerals"
        />
      </View>

      <View style={styles.heroShadow}>
        <Photo name="hero-grain" align="right" style={styles.hero}>
          <Scrim gradient="linear-gradient(100deg,#0e1430 12%,rgba(20,29,64,0.92) 46%,rgba(20,29,64,0.34) 78%,rgba(14,20,48,0.12))" />
          <View style={styles.heroBody}>
            <Text style={styles.kicker}>MINERAL BRIDGE ASSURED</Text>
            <View style={styles.heroTitle}>
              <Text
                style={[styles.heroTitleText, styles.heroShadowText]}
                leading={1.25}
              >
                Stock we own, sold
              </Text>
              <GradientText style={[styles.heroTitleText, styles.heroGold]}>
                at a fixed price
              </GradientText>
            </View>
            <Text style={styles.heroSub} leading={1.5}>
              Bought outright, assayed on intake, held in our vault.
            </Text>
            <PressableScale
              activeScale={0.96}
              onPress={() => go('bTypes')}
              style={styles.browse}
            >
              <Text style={styles.browseText}>Browse Marketplace</Text>
              <Icon
                name="chevronRight"
                size={14}
                color="#2b1f04"
                strokeWidth={2.6}
              />
            </PressableScale>
          </View>
        </Photo>
      </View>

      <View style={styles.quick}>
        {QUICK.map(q => (
          <PressableScale
            key={q.label}
            activeScale={0.93}
            onPress={() => go(q.to)}
            style={styles.quickItem}
          >
            <IconTile
              size={42}
              radius={12}
              bgColor={q.bg}
              color={q.fg}
              d={q.icon}
              iconSize={19}
            />
            <Text style={styles.quickLabel} leading={1.3}>
              {q.label}
            </Text>
            {q.count ? (
              <View style={styles.quickBadge}>
                <Text style={styles.quickBadgeText}>{q.count}</Text>
              </View>
            ) : null}
          </PressableScale>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <SectionLabel>BROWSE BY CATEGORY</SectionLabel>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      <Grid columns={2} gap={13}>
        {catalog.categories
          .filter(c => matchesQuery(c.name, browseQuery))
          .map(c => (
          <PressableScale
            key={c.slug}
            onPress={() => {
              catalog.chooseCategory(c.slug);
              go('bTypes');
            }}
            style={styles.cat}
          >
            {c.imageUrl ? (
              <Image source={{ uri: c.imageUrl }} style={styles.catImage} resizeMode="contain" />
            ) : c.img ? (
              <Photo name={c.img as 'cat-precious'} style={styles.catImage} />
            ) : (
              <View style={styles.catImage} />
            )}
            <View style={styles.catBody}>
              <Text style={styles.catName} leading={1.25}>
                {c.name}
              </Text>
              <Text style={styles.catCount}>{c.count || `${c.subcategories.length} subcategories`}</Text>
            </View>
          </PressableScale>
        ))}
      </Grid>
      <SectionLabel style={styles.featuredLabel}>FEATURED</SectionLabel>
      <View style={styles.featured}>
        {PRODUCTS.filter(p => matchesQuery(p.name, browseQuery)).map(p => (
          <PressableScale
            key={p.name}
            onPress={() => go('bDetail')}
            style={styles.featuredCard}
          >
            <Text style={styles.featuredName}>{p.name}</Text>
            <Text style={styles.featuredPrice}>{p.price}</Text>
          </PressableScale>
        ))}
      </View>
      {catalog.categories.filter(c => matchesQuery(c.name, browseQuery)).length === 0 &&
      PRODUCTS.filter(p => matchesQuery(p.name, browseQuery)).length === 0 ? (
        <Text style={styles.empty}>No minerals match that search.</Text>
      ) : null}
    </ScreenContainer>
  );
}

const heroText = {
  textShadowColor: 'rgba(14,20,48,0.5)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
};

const styles = StyleSheet.create({
  content: { paddingTop: 2, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  r14: { borderRadius: 14 },
  nudge: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    boxShadow: shadows.xs,
  },
  nudgeTitle: { fontSize: 13, fontWeight: '600', color: '#1a1f36' },
  nudgeSub: { fontSize: 11.5, color: '#7b839c', marginTop: 2 },
  nudgeLink: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  guest: {
    marginBottom: 14,
    backgroundColor: '#fef9ec',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  guestIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#fbf3e4',
    borderWidth: 1,
    borderColor: '#eddfc0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: { fontSize: 13, fontWeight: '600', color: '#b45309' },
  guestSub: { fontSize: 11.5, color: '#9a6a1a', marginTop: 2 },
  signIn: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#1e2a5a',
    justifyContent: 'center',
  },
  signInText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  hello: { fontSize: 12.5, color: '#6b7290', fontWeight: '600' },
  name: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e5ec',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    borderColor: '#f4f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600', lineHeight: 15 },
  search: {
    marginTop: 14,
    height: 46,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    boxShadow: shadows.hairline,
  },
  searchText: { flex: 1, fontSize: 13.5, color: '#1a1f36', padding: 0 },
  featuredLabel: { marginTop: 20, marginBottom: 10 },
  featured: { gap: 8 },
  featuredCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  featuredName: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  featuredPrice: { fontSize: 12, color: '#6b7290', marginTop: 3 },
  empty: { fontSize: 13.5, color: '#6b7290', marginTop: 12 },
  heroShadow: {
    marginTop: 16,
    borderRadius: 14,
    boxShadow: shadows.heroStrong,
  },
  hero: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#0e1430' },
  heroBody: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 96,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#a9b5dd',
  },
  heroTitle: { marginTop: 7 },
  heroTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 25,
  },
  heroShadowText: heroText,
  heroGold: { fontStyle: 'italic', fontWeight: '700' },
  heroSub: {
    fontSize: 12.5,
    color: '#d3daf0',
    marginTop: 8,
    textShadowColor: 'rgba(14,20,48,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  browse: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    height: 38,
    paddingHorizontal: 17,
    borderRadius: 9999,
    experimental_backgroundImage: gradients.gold,
    boxShadow: '0 2px 10px rgba(200,150,47,0.34)',
  },
  browseText: { color: '#2b1f04', fontSize: 12.5, fontWeight: '700' },
  quick: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 15,
    paddingHorizontal: 8,
    flexDirection: 'row',
    boxShadow: shadows.card,
  },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4a5170',
    textAlign: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: -3,
    right: 11,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 2,
    marginBottom: 12,
  },
  seeAll: { fontSize: 12.5, fontWeight: '700', color: '#2563eb' },
  cat: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  catImage: { height: 140, width: '100%', backgroundColor: '#eef1f6' },
  catBody: { paddingTop: 11, paddingHorizontal: 12, paddingBottom: 13 },
  catName: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  catCount: {
    fontSize: 11.5,
    color: '#8890ad',
    marginTop: 3,
    fontWeight: '600',
  },
});
