import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { ErrBox, OptionCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import { BUYER_TYPES, SELLER_TYPES } from '../../lib/mb4';
import { colors as c } from '../../theme';

/** Shared by registration step 1 (regType) and Profile › Buyer / seller type (bizType). */
export function AccountTypeScreen() {
  const store = useStore(), s = store.state, r = s.reg;
  const setR = (p: Partial<AppState['reg']>) => store.setState(x => ({ reg: { ...x.reg, ...p }, regErr: '' }));
  const roles: [AppState['reg']['role'], string, string][] = [['buyer', 'Buyer', 'Buy verified minerals'], ['seller', 'Seller', 'Sell minerals to Mineral Bridge'], ['both', 'Both', 'Buy and sell from one account']];
  const group = (title: string, list: [string, string, string][], val: string, key: 'buyerType' | 'sellerType') => (
    <>
      <Label style={{ marginTop: 22, marginHorizontal: 2, marginBottom: 8 }}>{title}</Label>
      <View style={{ gap: 8 }}>{list.map(([id, name, sub]) => <OptionCard key={id} on={val === id} title={name} sub={sub} onPress={() => setR({ [key]: id })} />)}</View>
    </>
  );
  return (
    <FadeUp style={{ paddingTop: 10, paddingHorizontal: 22, paddingBottom: 24 }}>
      <Txt serif s={32} lh={1.05} ls={-0.3}>{s.screen === 'bizType' ? 'Update your account type' : 'How will you use Mineral Bridge?'}</Txt>
      <Txt s={14} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>Choose Both to buy and sell from one account. Pick one buyer type and one seller type.</Txt>
      <Label style={{ marginTop: 22, marginHorizontal: 2, marginBottom: 8 }}>I WANT TO</Label>
      <View style={{ gap: 8 }}>{roles.map(([id, name, sub]) => <OptionCard key={id} on={r.role === id} title={name} sub={sub} onPress={() => setR({ role: id })} />)}</View>
      {r.role === 'buyer' || r.role === 'both' ? group('BUYER TYPE', BUYER_TYPES, r.buyerType, 'buyerType') : null}
      {r.role === 'seller' || r.role === 'both' ? group('SELLER TYPE', SELLER_TYPES, r.sellerType, 'sellerType') : null}
      {s.regErr ? <ErrBox>{s.regErr}</ErrBox> : null}
    </FadeUp>
  );
}
