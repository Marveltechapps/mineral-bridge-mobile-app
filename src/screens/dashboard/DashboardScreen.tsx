import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { BgImage, Card, Chevron, ListCard } from '../../components/ui/Blocks';
import { LinearFill } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { CATS, PRODUCTS } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { CatalogueState } from '../buy/CatalogueState';

/** Home tab ("home" screen in the design). */
export function DashboardScreen() {
  const store = useStore(), s = store.state, u = s.user;
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - 36 - 8) / 2);
  const first = u ? (String(u.name || '').trim().split(' ')[0] || String(u.business || '').trim() || String(u.email || '').split('@')[0] || 'Trader') : 'Guest';
  const mine = s.orders.map(o => store.view(o)), actN = mine.filter(v => v.you).length;
  const unread = u ? s.unread : 0;
  const kycText = u && u.kyc === 'pending' ? 'KYC under review · ' + u.kycRef : u && u.kyc === 'rejected' ? 'KYC needs another document' : 'Complete KYC to buy or sell';
  const stats: [string, number][] = [['Action needed', actN], ['Active orders', mine.filter(v => v.kind === 'buy' && !v.done && !v.rej).length], ['Sell requests', mine.filter(v => v.kind === 'sell' && !v.done && !v.rej).length]];
  const goSignup = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signup' } })); store.go('auth'); };

  return (
    <FadeUp style={{ paddingTop: 4, paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Label>WELCOME BACK</Label>
          <Txt serif s={28} lh={1.1} style={{ marginTop: 2 }}>{first}</Txt>
        </View>
        <Tap label="Notifications" onPress={() => store.go('notifs')} style={st.bell}>
          <Icon d={IC.bell} size={18} />
          {unread ? <View style={st.badge}><Txt s={10.5} w={700} c="#fff">{String(unread)}</Txt></View> : null}
        </Tap>
      </View>
      {u && u.kyc !== 'verified' ? (
        <Tap onPress={() => store.go('kycStatus')} style={st.banner}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.amber }} />
          <Txt s={13} w={600} c={c.amberInk} style={{ flex: 1 }}>{kycText}</Txt>
          <Chevron />
        </Tap>
      ) : null}
      {!u ? (
        <Tap onPress={goSignup} style={st.banner}>
          <Txt s={13} w={600} c={c.amberInk} style={{ flex: 1 }}>You are browsing as a guest. Create an account to buy or sell.</Txt>
          <Chevron />
        </Tap>
      ) : null}
      <BgImage source={imgFor('gold-bullion')} style={st.hero}>
        <LinearFill stops={[[0, 'rgba(18,18,20,.15)'], [1, 'rgba(18,18,20,.86)']]} />
        <View style={st.heroText}>
          <Label c={c.gold}>INSPECTED · CERTIFIED · TRACKED</Label>
          <Txt serif s={28} lh={1.05} c={c.paper} style={{ marginTop: 6 }}>Verified minerals, from mine to delivery.</Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Tap onPress={() => store.jump('cats')} style={[st.heroBtn, { backgroundColor: c.gold }]}><Txt s={14} w={600}>Buy minerals</Txt></Tap>
            <Tap onPress={() => store.jump('sellCats')} style={[st.heroBtn, st.heroGhost]}><Txt s={14} w={600} c={c.paper}>Sell minerals</Txt></Tap>
          </View>
        </View>
      </BgImage>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {stats.map(([l, n]) => (
          <Tap key={l} onPress={() => { store.setState({ otab: l === 'Sell requests' ? 'sell' : 'buy' }); store.jump('orders'); }} style={{ flex: 1, minWidth: 0 }}>
            <Card r={18} style={{ paddingVertical: 13, paddingHorizontal: 12 }}>
              <Txt mono s={22} w={600}>{String(n)}</Txt>
              <Txt s={11.5} c={c.muted} lh={1.3} style={{ marginTop: 3 }}>{l}</Txt>
            </Card>
          </Tap>
        ))}
      </View>
      {actN > 0 && u ? (
        <>
          <Label style={st.sec}>NEEDS YOUR ACTION</Label>
          <ListCard>
            {mine.filter(v => v.you).slice(0, 3).map(v => (
              <Tap key={v.id} onPress={() => store.go('order', { oid: v.id })} style={st.needRow}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.gold }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt s={14} w={600}>{v.actionLabel}</Txt>
                  <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{v.id} · {v.title}</Txt>
                </View>
                <Chevron />
              </Tap>
            ))}
          </ListCard>
        </>
      ) : null}
      <Label style={st.sec}>MINERAL CATEGORIES</Label>
      {!CATS.length ? <CatalogueState what="minerals" /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CATS.map(cat => (
          <Tap key={cat.id} scale={0.97} onPress={() => store.go('minerals', { cat: cat.id, search: '' })} style={{ width: tile }}>
            <BgImage source={imgFor(cat.img)} style={st.cat}>
              <LinearFill stops={[[0.3, 'rgba(18,18,20,0)'], [1, 'rgba(18,18,20,.8)']]} />
              <View style={st.catText}>
                <Txt s={14} w={600} c={c.paper}>{cat.name}</Txt>
                <Txt s={11.5} c="rgba(244,242,237,.8)" style={{ marginTop: 2 }}>{PRODUCTS.filter(x => cat.minerals.some(([m]) => m === x.mineral)).length + ' lots'}</Txt>
              </View>
            </BgImage>
          </Tap>
        ))}
      </View>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: c.alert, alignItems: 'center', justifyContent: 'center' },
  banner: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.amberBg, borderWidth: 1, borderColor: c.amberLine, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hero: { marginTop: 14, borderRadius: 26, height: 228 },
  heroText: { position: 'absolute', left: 18, right: 18, bottom: 16 },
  heroBtn: { flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroGhost: { backgroundColor: 'rgba(244,242,237,.14)', borderWidth: 1, borderColor: 'rgba(244,242,237,.3)' },
  sec: { marginTop: 22, marginHorizontal: 4, marginBottom: 8 },
  needRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.hair },
  cat: { height: 120, borderRadius: 20 },
  catText: { position: 'absolute', left: 12, right: 12, bottom: 10 },
});
