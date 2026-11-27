import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, RadGrad, T } from '../../components/mb/base';
import { Btn, Card, IconTile, Row, Section } from '../../components/mb/kit';
import { BUYER_TYPES, SELLER_TYPES } from '../../lib/mb4';
import { D } from '../../theme';
import { mineOf } from '../auctions/auctionVals';
import { NavyCard } from '../orders/OrderTrackingScreen';

export const kycWordOf = (k?: string) => (k ? ({ verified: 'KYC verified', pending: 'KYC under review', rejected: 'KYC needs action', none: 'KYC not started' } as Record<string, string>)[k] : '');

type MenuRow = [string, string, string, () => void];

/** `menuGroup(title, rows)`. */
export function MenuGroup({ title, rows }: { title: string; rows: MenuRow[] }) {
  return (
    <View>
      <Section t={title} />
      <Card>
        {rows.map(([icn, t, v, onPress], i) => (
          <Row key={t} last={i === rows.length - 1} pv={12} style={{ gap: 12 }} onPress={onPress}>
            <IconTile icon={icn} sz={38} r={12} c={D.GD} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={14} w={800}>{t}</T>
              {v ? <T s={12} w={600} c={D.MUT} lines={1} style={{ marginTop: 1 }}>{v}</T> : null}
            </View>
            <Ic name="chevronRight" s={18} c={D.MUT} />
          </Row>
        ))}
      </Card>
    </View>
  );
}

/** Profile tab (`scr_profile`). */
export function ProfileScreen() {
  const store = useStore(), s = store.state, u = s.user;
  const help: MenuRow = ['help', 'Help & support', 'Phone, SMS, email, WhatsApp, chat', () => store.go('help')];
  const toAuth = (mode: 'signup' | 'signin') => { store.setState(x => ({ auth: { ...x.auth, mode }, authErr: '' })); store.go('auth'); };
  if (!u) {
    return (
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: D.G, borderRadius: 22, padding: 18 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(217,180,86,.18)', alignItems: 'center', justifyContent: 'center' }}><T s={22} w={800} c={D.GOLD}>G</T></View>
          <View>
            <T s={17} w={800} c={D.white}>Guest</T>
            <T s={12.5} w={600} c={D.navyMute}>Browsing as guest</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <View style={{ flex: 1 }}><Btn label="Create account" onPress={() => toAuth('signup')} /></View>
          <View style={{ flex: 1 }}><Btn label="Sign in" kind="ghost" onPress={() => toAuth('signin')} /></View>
        </View>
        <View style={{ marginTop: 16 }}><MenuGroup title="Help" rows={[help]} /></View>
      </View>
    );
  }
  const bt = u.buyerType ? (BUYER_TYPES.find(b => b[0] === u.buyerType) || [])[1] : '';
  const stp = u.sellerType ? (SELLER_TYPES.find(b => b[0] === u.sellerType) || [])[1] : '';
  const kt = ({ verified: [D.greenBg, D.green], pending: [D.amberBg, D.AMBER], rejected: [D.redBg, D.DANGER], none: [D.redBg, D.DANGER] } as Record<string, [string, string]>)[u.kyc] || [D.chip, D.ink2];
  const ini = String(u.name || '').trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'MB';
  const A = s.auctions || [], openRf = s.orders.filter(x => x.refund && !['refunded', 'declined'].includes(x.refund.status)).length;
  const tags = [bt ? 'Buyer · ' + bt : '', stp ? 'Seller · ' + stp : ''].filter(Boolean) as string[];
  const unread = s.unread || s.notifs.filter(n => !n.read).length;
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 24 }}>
      <NavyCard>
        <View style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160 }}><RadGrad rx={0.71} stops={[[0, 'rgba(217,180,86,.35)'], [0.7, 'rgba(217,180,86,0)']]} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: D.GOLD, alignItems: 'center', justifyContent: 'center' }}><T s={21} w={800} c={D.G}>{ini}</T></View>
          <View style={{ minWidth: 0, flex: 1 }}>
            <T s={18} w={800} c={D.white}>{u.name}</T>
            <T s={12.5} w={600} c={D.navyMute}>{u.business + (u.country ? ' · ' + u.country : '')}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {tags.map(t => <View key={t} style={{ paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,.18)' }}><T s={10.5} w={800} c={D.white}>{t}</T></View>)}
          <View style={{ paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: kt[0] }}><T s={10.5} w={800} c={kt[1]}>{kycWordOf(u.kyc)}</T></View>
        </View>
        <T s={12} w={600} c={D.navyFaint} style={{ marginTop: 10 }}>{[u.phone, u.email].filter(Boolean).join(' · ')}</T>
      </NavyCard>
      <MenuGroup title="Account" rows={[
        ['edit', 'Edit profile', 'Name, business, contact', () => { store.setState({ edit: { name: u.name, business: u.business, email: u.email || '', phone: u.phone || '', country: u.country || '' }, editErr: {} }); store.go('editProfile'); }],
        ['users', 'Buyer / seller type', [bt, stp].filter(Boolean).join(' + '), () => { store.setState({ reg: { ...s.reg, role: u.role, buyerType: u.buyerType || '', sellerType: u.sellerType || '' }, regErr: '' }); store.go('bizType'); }],
        ['shield', 'KYC & documents', kycWordOf(u.kyc), () => store.go('kycStatus')],
      ]} />
      <MenuGroup title="Activity" rows={[
        ['gavel', 'Auctions', A.filter(a => a.status === 'live').length + ' live · ' + A.filter(a => mineOf(a) && a.status !== 'ended').length + ' with your bids', () => store.go('auctions', { atab: 'live' })],
        ['refund', 'Refunds', openRf ? openRf + ' in progress' : 'Request and track refunds', () => store.go('refunds')],
        ['box', 'Orders & sell requests', s.orders.length + ' in your history', () => store.jump('orders')],
        ['bell', 'Notifications', unread + ' unread', () => store.go('notifs')],
        ['msg', 'Notification channels', (['email', 'sms', 'whatsapp', 'push'] as const).filter(k => s.prefs[k]).length + ' of 4 on', () => store.go('prefs')],
      ]} />
      <MenuGroup title="Help" rows={[help]} />
      <View style={{ marginTop: 16 }}><Btn label="Log out" kind="danger" icon="logout" onPress={() => store.setState({ sheet: 'logout' })} /></View>
    </View>
  );
}
