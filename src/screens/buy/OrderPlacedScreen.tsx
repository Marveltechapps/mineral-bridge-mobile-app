import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Grad, Ic, PopIn, T } from '../../components/mb/base';
import { Btn, RefPill, Steps, TextBtn } from '../../components/mb/kit';
import { D, SHADOW } from '../../theme';

/** Success layout shared by Order placed, Sell request submitted and Auction won. */
export function SuccessLayout({ icon = 'check', ring, title, body, ts = 24, bs = 14, refK, refV, children, cta, onCta, cta2, onCta2 }: { icon?: string; ring?: boolean; title: string; body: string; ts?: number; bs?: number; refK?: string; refV?: string; children?: React.ReactNode; cta: string; onCta: () => void; cta2: string; onCta2: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 22 + insets.bottom }}>
      <Grad stops={[[0, D.cream], [1, D.BG]]} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
        <PopIn>
          <View style={{ width: ring ? 96 : 92, height: ring ? 96 : 92, borderRadius: 48, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center', boxShadow: ring ? '0 0 0 10px rgba(217,180,86,.25), ' + SHADOW.badge : SHADOW.badge }}>
            <Ic name={icon} s={ring ? 42 : 44} c={D.GOLD} w={ring ? 2.2 : 3} />
          </View>
        </PopIn>
        <T s={ts} w={800} center style={{ marginTop: 22 }}>{title}</T>
        <T s={bs} w={600} c={D.MUT} lh={ring ? undefined : 1.5} center style={{ marginTop: ring ? 6 : 8, maxWidth: bs === 14 ? 290 : 300 }}>{body}</T>
        {refK ? <RefPill k={refK} v={refV || ''} /> : null}
        {children}
      </View>
      <View style={{ marginTop: 18 }}><Btn label={cta} icon="arrowRight" onPress={onCta} /></View>
      <TextBtn label={cta2} pad={12} onPress={onCta2} />
    </View>
  );
}

/** Order placed (`scr_placed`). */
export function OrderPlacedScreen() {
  const store = useStore(), s = store.state;
  const id = (s.orders.find(o => o.id === s.oid) || { id: s.oid }).id;
  return (
    <SuccessLayout title="Order placed" body="Mineral Bridge Operations will review your order and send a quotation. No payment has been taken." refK="ORDER" refV={id}
      cta="Track order" onCta={() => store.primary()} cta2="Continue browsing" onCta2={() => store.secondary()}>
      <View style={{ width: '100%', marginTop: 22 }}><Steps items={['Order review and acceptance', 'Quotation for you to accept', 'E-contract signed by both sides']} /></View>
      <T s={12} w={600} c={D.MUT} center style={{ marginTop: 12 }}>You will be notified by email, SMS and WhatsApp at each step.</T>
    </SuccessLayout>
  );
}
