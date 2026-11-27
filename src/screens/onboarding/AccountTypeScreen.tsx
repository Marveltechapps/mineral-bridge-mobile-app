import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { Rise, T } from '../../components/mb/base';
import { Alert, PageTitle, RadioCard, Section } from '../../components/mb/kit';
import { BUYER_TYPES, SELLER_TYPES } from '../../lib/mb4';
import { D } from '../../theme';

const ROLES: [AppState['reg']['role'], string, string][] = [['buyer', 'Buyer', 'Buy verified minerals'], ['seller', 'Seller', 'Sell minerals to Mineral Bridge'], ['both', 'Both', 'Buy and sell from one account']];
const SUB = 'Choose Both to buy and sell from one account. Pick one buyer type and one seller type.';

/** Registration step 1 (`scr_regType`) and Profile › Buyer / seller type (`scr_bizType`). */
export function AccountTypeScreen() {
  const store = useStore(), s = store.state, r = s.reg, biz = s.screen === 'bizType';
  const setR = (p: Partial<AppState['reg']>) => store.setState(x => ({ reg: { ...x.reg, ...p }, regErr: '' }));
  const group = (title: string, list: [string, string, string][], val: string, key: 'buyerType' | 'sellerType') => (
    <>
      <Section t={title} />
      <Rise dur={300} style={{ gap: 8 }}>{list.map(([id, n, sb]) => <RadioCard key={id} on={val === id} name={n} sub={sb} onPress={() => setR({ [key]: id })} />)}</Rise>
    </>
  );
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: biz ? 18 : 22 }}>
      {biz ? <PageTitle t="Update your account type" sub={SUB} /> : (
        <>
          <T s={24} w={800} ls={-0.02} lh={1.15}>How will you use Mineral Bridge?</T>
          <T s={13.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 8 }}>{SUB}</T>
        </>
      )}
      <Section t="I want to" />
      <View style={{ gap: 8 }}>{ROLES.map(([id, n, sb]) => <RadioCard key={id} on={r.role === id} name={n} sub={sb} onPress={() => setR({ role: id })} />)}</View>
      {r.role === 'buyer' || r.role === 'both' ? group('Buyer type', BUYER_TYPES, r.buyerType, 'buyerType') : null}
      {r.role === 'seller' || r.role === 'both' ? group('Seller type', SELLER_TYPES, r.sellerType, 'sellerType') : null}
      <Alert msg={s.regErr} />
    </View>
  );
}
