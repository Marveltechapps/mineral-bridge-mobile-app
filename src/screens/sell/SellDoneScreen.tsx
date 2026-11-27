import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Steps } from '../../components/mb/kit';
import { D } from '../../theme';
import { SuccessLayout } from '../buy/OrderPlacedScreen';

const NEXT: [string, string][] = [['Review and price', 'Our operations team checks your request and contacts you to agree a price.'], ['E-contract', 'Both sides accept the price, then sign the e-contract.'], ['Inspection and payment', 'Mineral Bridge inspects the product at your site, SGS tests it, then payment is released before pickup.']];

/** Sell request submitted (`scr_sellDone`). */
export function SellDoneScreen() {
  const store = useStore(), s = store.state;
  const so = s.orders.find(o => o.id === s.oid), sv = so && so.kind === 'sell' ? so.sell : undefined;
  const summary = sv ? sv.qty + ' ' + sv.unit + ' of ' + sv.name + ' · ' + sv.photos + ' photos. ' : '';
  return (
    <SuccessLayout title="Sell request submitted" ts={23} bs={13.5} body={summary + 'Nothing is sold until you accept a price and sign the e-contract.'} refK="REF" refV={so ? so.id : s.oid}
      cta="Track request" onCta={() => { store.setState({ otab: 'sell' }); store.primary(); }} cta2="Back to home" onCta2={() => store.secondary()}>
      <View style={{ width: '100%', marginTop: 20 }}>
        <T s={12.5} w={800} c={D.MUT} style={{ marginHorizontal: 2, marginBottom: 10 }}>What happens next</T>
        <Steps items={NEXT} />
      </View>
    </SuccessLayout>
  );
}
