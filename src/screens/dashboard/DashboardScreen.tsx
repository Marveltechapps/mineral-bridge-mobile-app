import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Grad, Ic, Rise, T } from '../../components/mb/base';
import { catIm, IMG, ImFill, imBg } from '../../components/mb/art';
import { Grid2, IconBtn, Press } from '../../components/mb/kit';
import { CATS, PRODUCTS } from '../../lib/mb4';
import { CAT_TINT, catKey, D, SHADOW } from '../../theme';
import { CatalogueState } from '../buy/CatalogueState';
import { byAvailable, ProductCard } from '../buy/productCard';

const firstName = (u: { name?: string; business?: string; email?: string } | null) =>
  u ? (String(u.name || '').trim().split(' ')[0] || String(u.business || '').trim() || String(u.email || '').split('@')[0] || 'Trader') : 'Guest';

/** Sticky top of Home: avatar + greeting, search / cart / notifications. */
export function DashboardTop() {
  const store = useStore(), s = store.state, u = s.user, first = firstName(u);
  return (
    <View style={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 14, zIndex: 15 }}>
      <Grad stops={[[0, D.cream], [1, D.BG]]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Press scale={0.98} onPress={() => store.jump('profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 }}>
          <View style={st.avatar}><T s={16} w={800} c={D.GOLD}>{first[0].toUpperCase()}</T></View>
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <T s={11.5} w={700} c={D.MUT}>{u ? 'Welcome back' : 'Welcome'}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <T s={16} w={800} lines={1} style={{ flexShrink: 1 }}>{first}</T>
              <Ic name="chevronDown" s={14} c={D.MUT} />
            </View>
          </View>
        </Press>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconBtn icon="search" label="Search" onPress={() => store.jump('cats')} />
          <IconBtn icon="cart" label="Cart" badge={s.cart.length} onPress={() => store.go('cart')} />
          <IconBtn icon="bell" label="Notifications" badge={u ? s.unread || s.notifs.filter(n => !n.read).length : 0} onPress={() => store.go('notifs')} />
        </View>
      </View>
    </View>
  );
}

function Head({ t, onAll }: { t: string; onAll?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <T s={16} w={800} style={{ flexShrink: 1 }}>{t}</T>
      {onAll ? <Press onPress={onAll}><T s={12.5} w={800} c={D.G}>See all</T></Press> : null}
    </View>
  );
}

/** Home tab (`scr_home`). */
export function DashboardScreen() {
  const store = useStore(), s = store.state, u = s.user;
  useEffect(() => { void store.task(store.remote.loadCatalogue()); }, [store]);
  const views = u ? s.orders.map(o => store.view(o)) : [], act = views.filter(v => v.you).slice(0, 3);
  const stats: [string, number, 'buy' | 'sell'][] = [['Action needed', views.filter(v => v.you).length, 'buy'], ['Active orders', views.filter(v => v.kind === 'buy' && !v.done && !v.rej).length, 'buy'], ['Sell requests', views.filter(v => v.kind === 'sell' && !v.done && !v.rej).length, 'sell']];
  const toBuy = (cat = '') => store.jump('cats', { cat, search: '' });
  const lotsOf = (minerals: [string, string][]) => PRODUCTS.filter(x => minerals.some(([m]) => m === x.mineral));
  const rejected = u && u.kyc === 'rejected';
  return (
    <Rise dur={280} style={{ paddingHorizontal: 16, paddingBottom: 26 }}>
      {u && u.kyc !== 'verified' ? (
        <Press scale={0.99} onPress={() => (u.kyc === 'pending' ? store.go('kycDone') : store.go('kyc'))} style={[st.banner, { backgroundColor: rejected ? D.dangerBg : D.amberBg }]}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rejected ? D.DANGER : D.AMBER }} />
          <T s={13} w={700} c={rejected ? D.DANGER : D.amberInk2} style={{ flex: 1 }}>{u.kyc === 'pending' ? 'KYC under review · ' + u.kycRef : rejected ? 'KYC needs another document' : 'Complete KYC to buy or sell'}</T>
          <Ic name="chevronRight" s={18} c={D.MUT} />
        </Press>
      ) : null}
      {!u ? (
        <Press scale={0.99} onPress={() => { store.setState(x => ({ auth: { ...x.auth, mode: 'signup' } })); store.go('auth'); }} style={[st.banner, { backgroundColor: D.TINT }]}>
          <T s={13} w={700} c={D.GD} style={{ flex: 1 }}>You are browsing as a guest. Create an account to buy or sell.</T>
          <Ic name="chevronRight" s={18} c={D.G} />
        </Press>
      ) : null}

      <View style={st.hero}>
        <Image source={IMG.grains} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
        <Grad angle={105} stops={[[0.08, 'rgba(14,26,51,.94)'], [0.45, 'rgba(20,40,75,.8)'], [1, 'rgba(20,40,75,.12)']]} />
        <View style={{ padding: 20, maxWidth: '78%' }}>
          <View style={st.heroTag}><T s={10} w={800} c={D.white} ls={0.08}>INSPECTED · CERTIFIED · TRACKED</T></View>
          <T s={22} w={800} c={D.white} lh={1.12} style={{ marginTop: 11 }}>Verified minerals, from mine to delivery.</T>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 15 }}>
            <Press onPress={() => toBuy()} style={[st.heroBtn, { backgroundColor: D.GOLD }]}><T s={12.5} w={800} c={D.G}>Buy minerals</T></Press>
            <Press onPress={() => store.jump('sellCats')} style={[st.heroBtn, { backgroundColor: 'rgba(255,255,255,.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,.4)' }]}><T s={12.5} w={800} c={D.white}>Sell minerals</T></Press>
          </View>
        </View>
      </View>

      {u ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {stats.map(([l, n, ot]) => (
            <Press key={l} onPress={() => store.jump('orders', { otab: ot })} style={st.stat}>
              <T s={20} w={800} c={l === 'Action needed' && n ? D.AMBER : D.INK}>{String(n)}</T>
              <T s={11} w={700} c={D.MUT} style={{ marginTop: 2 }}>{l}</T>
            </Press>
          ))}
        </View>
      ) : null}

      {act.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <Head t="Needs your action" onAll={() => store.jump('orders')} />
          <View style={st.list}>
            {act.map((o, i) => (
              <Press key={o.id} scale={0.99} onPress={() => store.go('order', { oid: o.id })} style={[st.actRow, { borderBottomWidth: i < act.length - 1 ? 1 : 0 }]}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: D.AMBER }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T s={13.5} w={800}>{o.actionLabel}</T>
                  <T s={11.5} w={600} c={D.MUT} style={{ marginTop: 2 }}>{o.id + ' · ' + o.title}</T>
                </View>
                <Ic name="chevronRight" s={18} c={D.MUT} />
              </Press>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: 22 }}>
        <Head t="Mineral categories" onAll={() => toBuy()} />
        {!CATS.length ? <CatalogueState what="minerals" /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 4 }}>
            {CATS.map(c => {
              const k = catKey(c.id), im = catIm(c.id);
              return (
                <Press key={c.id} onPress={() => toBuy(c.id)} style={{ width: 78, alignItems: 'center', gap: 7 }}>
                  <View style={[st.catCircle, { backgroundColor: k === 'precious' ? D.white : imBg(im, CAT_TINT[k]) }]}><ImFill im={im} inset={0.78} /></View>
                  <T s={10.5} w={700} center lh={1.2}>{c.name}</T>
                  <T s={10} w={600} c={D.MUT} style={{ marginTop: -4 }}>{lotsOf(c.minerals).length + ' lots'}</T>
                </Press>
              );
            })}
          </ScrollView>
        )}
      </View>

      {CATS.map(c => {
        const lots = [...lotsOf(c.minerals)].sort(byAvailable);
        if (!lots.length) return null;
        return (
          <View key={c.id} style={{ marginTop: 24 }}>
            <Head t={c.name + ' · ' + lots.length} onAll={() => toBuy(c.id)} />
            <Grid2>{lots.map(p => <ProductCard key={p.id} store={store} p={p} />)}</Grid2>
          </View>
        );
      })}

      <View style={st.verified}>
        <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center' }}><Ic name="shield" s={28} c={D.G} w={1.8} /></View>
        <View style={{ flex: 1 }}>
          <T s={15} w={800} c={D.GD}>Verified at every step</T>
          <T s={12.5} w={600} c={D.MUT} lh={1.4} style={{ marginTop: 2 }}>Inspected lots, agreed quotations, e-contracts and tracked delivery.</T>
        </View>
      </View>
    </Rise>
  );
}

const st = StyleSheet.create({
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
  banner: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 10 },
  hero: { marginTop: 14, borderRadius: 20, overflow: 'hidden', minHeight: 178, backgroundColor: D.INK, boxShadow: SHADOW.hero },
  heroTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,.3)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999 },
  heroBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 11 },
  stat: { flex: 1, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 16, padding: 12 },
  list: { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, paddingVertical: 2, paddingHorizontal: 14 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomColor: D.BOR },
  catCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: '#EFEFEF', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -8px rgba(14,26,51,.3)' },
  verified: { marginTop: 24, borderRadius: 18, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 },
});
