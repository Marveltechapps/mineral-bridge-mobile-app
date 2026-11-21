import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Chevron, ListCard } from '../../components/ui/Blocks';
import { Icon } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { BUYER_TYPES, SELLER_TYPES } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { mineOf } from '../auctions/auctionVals';

export const kycWordOf = (k?: string) => (k ? ({ verified: 'KYC verified', pending: 'KYC under review', rejected: 'KYC needs action', none: 'KYC not started' } as Record<string, string>)[k] : '');

export function ProfileScreen() {
  const store = useStore(), s = store.state, u = s.user;
  const bt = u && u.buyerType ? (BUYER_TYPES.find(b => b[0] === u.buyerType) || [])[1] : '';
  const stp = u && u.sellerType ? (SELLER_TYPES.find(b => b[0] === u.sellerType) || [])[1] : '';
  const tone = !u ? ['', ''] : u.kyc === 'verified' ? [c.greenBg, c.green] : u.kyc === 'pending' ? [c.amberBg, c.amber] : [c.redBg, c.red];
  const kycWord = u ? kycWordOf(u.kyc) : '';
  const initials = String((u && u.name) || '').trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let ini = 'G';
  if (u) ini = initials || 'MB';
  const tags = [bt ? 'Buyer · ' + bt : '', stp ? 'Seller · ' + stp : ''].filter(Boolean) as string[];
  const contact = u ? [u.phone, u.email].filter(Boolean).join(' · ') : '';
  const refundsN = s.orders.filter(x => x.refund && !['refunded', 'declined'].includes(x.refund.status)).length;
  const signup = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signup' }, authErr: '' })); store.go('auth'); };
  const signin = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signin' }, authErr: '' })); store.go('auth'); };
  const menu: [string, [string, string, string, () => void][]][] = u ? [
    ['ACCOUNT', [
      ['Edit profile', 'Name, business, contact', 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', () => { store.setState({ edit: { name: u.name, business: u.business, email: u.email || '', phone: u.phone || '', country: u.country || '' }, editErr: {} }); store.go('editProfile'); }],
      ['Buyer / seller type', [bt, stp].filter(Boolean).join(' + '), 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.9', () => { store.setState({ reg: { ...s.reg, role: u.role, buyerType: u.buyerType || '', sellerType: u.sellerType || '' }, regErr: '' }); store.go('bizType'); }],
      ['KYC & documents', kycWord, 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', () => store.go('kycStatus')],
    ]],
    ['ACTIVITY', [
      ['Auctions', (s.auctions || []).filter(a => a.status === 'live').length + ' live · ' + (s.auctions || []).filter(a => mineOf(a) && a.status !== 'ended').length + ' with your bids', 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5 7.5 17 14 10.5M3 21h9', () => store.go('auctions', { atab: 'live' })],
      ['Refunds', refundsN ? refundsN + ' in progress' : 'Request and track refunds', 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5', () => store.go('refunds')],
      ['Orders & sell requests', s.orders.length + ' in your history', 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4', () => store.jump('orders')],
      ['Notifications', s.unread + ' unread', 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0', () => store.go('notifs')],
      ['Notification channels', (['email', 'sms', 'whatsapp', 'push'] as const).filter(k => s.prefs[k]).length + ' of 4 on', 'M4 4h16v12H5.2L4 17.2z', () => store.go('prefs')],
    ]],
    ['HELP', [['Help & support', 'Phone, SMS, email, WhatsApp, chat', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01', () => store.go('help')]]],
  ] : [];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ padding: 18, borderRadius: 24, backgroundColor: c.ink }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' }}><Txt serif s={24}>{ini}</Txt></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt s={17} w={600} c={c.paper}>{u ? u.name : 'Guest'}</Txt>
            <Txt s={13} c={c.soft} style={{ marginTop: 2 }}>{u ? u.business : 'Browsing as guest'}</Txt>
          </View>
        </View>
        {tags.length || kycWord ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {tags.map(t => <View key={t} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: 'rgba(217,180,86,.16)' }}><Txt s={11.5} w={600} c={c.gold}>{t}</Txt></View>)}
            {kycWord ? <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: tone[0] }}><Txt s={11.5} w={600} c={tone[1]}>{kycWord}</Txt></View> : null}
          </View>
        ) : null}
        {contact ? <Txt s={12} c={c.faint} style={{ marginTop: 10 }}>{contact}</Txt> : null}
      </View>
      {!u ? (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Tap onPress={signup} style={{ height: 52, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt s={14.5} w={600} c={c.paper}>Create account</Txt></Tap>
          <Tap onPress={signin} style={{ height: 52, borderRadius: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}><Txt s={14.5} w={600}>Sign in</Txt></Tap>
        </View>
      ) : null}
      {menu.map(([h, rows]) => (
        <View key={h}>
          <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>{h}</Label>
          <ListCard>
            {rows.map(([l, sub, icon, tap], i) => (
              <Tap key={l} onPress={tap} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: i === rows.length - 1 ? 'transparent' : c.hair }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' }}><Icon d={icon} size={17} /></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt s={14.5} w={500}>{l}</Txt>
                  <Txt s={12} c={c.muted} lines={1} style={{ marginTop: 1 }}>{sub}</Txt>
                </View>
                <Chevron />
              </Tap>
            ))}
          </ListCard>
        </View>
      ))}
      {u ? (
        <Tap onPress={() => store.setState({ sheet: 'logout' })} style={{ marginTop: 16, height: 52, borderRadius: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.redLine, alignItems: 'center', justifyContent: 'center' }}>
          <Txt s={14.5} w={600} c={c.red}>Log out</Txt>
        </Tap>
      ) : null}
    </FadeUp>
  );
}
