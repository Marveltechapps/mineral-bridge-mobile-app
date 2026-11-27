import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { Press, Steps } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { SuccessLayout } from '../buy/OrderPlacedScreen';
import { prodOf } from './auctionVals';

/** You won the auction (`scr_auctionWon`). */
export function AuctionWonScreen() {
  const store = useStore(), s = store.state;
  const won = (s.auctions || []).find(x => x.id === s.aid && x.result === 'won');
  const p = won ? prodOf(won) : undefined;
  const ord = won && won.orderId ? s.orders.find(x => x.id === won.orderId) : undefined, cert = ord && ord.docs && ord.docs[0];
  const m = store.meta();
  return (
    <SuccessLayout icon="gavel" ring title="You won the auction" bs={13.5} body={won && p ? p.name + ' · ' + won.qty + ' ' + p.unit + ' · auction ' + won.id : ''}
      cta={m.cta || 'Track order'} onCta={() => store.primary()} cta2="Back to auctions" onCta2={() => store.secondary()}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 16, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 16, backgroundColor: D.G }}>
        <T s={11} w={800} c={D.navyFaint}>WINNING BID</T>
        <T s={20} w={800} c={D.GOLD}>{won ? MB.money(store.aucCur(won)) : ''}</T>
      </View>
      {cert && ord ? (
        <Press onPress={() => store.openDoc({ t: cert.type, num: cert.number, oid: ord.id })} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <Ic name="file" s={15} c={D.GD} /><T s={13} w={800} c={D.GD}>View auction result certificate</T>
        </Press>
      ) : null}
      <View style={{ width: '100%', marginTop: 20 }}><Steps items={['Pay the winning bid to release the lot', 'Track pickup, transit and delivery', 'Confirm receipt to complete the order']} /></View>
    </SuccessLayout>
  );
}
