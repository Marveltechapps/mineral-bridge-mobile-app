import React from 'react';
import { useStore } from '../../context/AppStore';
import { NumberedSteps, RefPill, SuccessBadge } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

export function OrderPlacedScreen() {
  const store = useStore(), s = store.state;
  const id = (s.orders.find(o => o.id === s.oid) || { id: '' }).id;
  return (
    <FadeUp style={{ paddingTop: 44, paddingHorizontal: 22, paddingBottom: 24 }}>
      <SuccessBadge />
      <Txt serif s={32} lh={1.05} ls={-0.3} center style={{ marginTop: 22 }}>Order placed</Txt>
      <Txt s={14} c={c.muted} lh={1.5} center style={{ marginTop: 10 }}>Mineral Bridge Operations will review your order and send a quotation. No payment has been taken.</Txt>
      <RefPill k="ORDER" v={id} />
      <NumberedSteps style={{ marginTop: 22 }} steps={['Order review and acceptance', 'Quotation for you to accept', 'E-contract signed by both sides']} />
      <Txt s={12.5} c={c.muted} center style={{ marginTop: 12 }}>You will be notified by email, SMS and WhatsApp at each step.</Txt>
    </FadeUp>
  );
}
