import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { NumberedSteps, RefPill } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp, Pop, Spin } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { prodOf } from './auctionVals';

export function AuctionWonScreen() {
  const store = useStore(), s = store.state;
  const won = (s.auctions || []).find(x => x.id === s.aid && x.result === 'won');
  const p = won ? prodOf(won) : undefined;
  return (
    <FadeUp style={{ paddingTop: 40, paddingHorizontal: 22, paddingBottom: 24 }}>
      <View style={{ width: 96, height: 96, alignSelf: 'center' }}>
        <Spin dur={16000} pointerEvents="none" style={{ position: 'absolute', left: -14, top: -14, right: -14, bottom: -14, borderRadius: 62, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(217,180,86,.6)' }} />
        <Pop><View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Icon d={IC.trophy} size={40} color={c.gold} sw={2} /></View></Pop>
      </View>
      <Txt serif s={34} lh={1.05} center style={{ marginTop: 26 }}>You won the auction</Txt>
      <Txt s={14} c={c.muted} lh={1.5} center style={{ marginTop: 10 }}>{won && p ? p.name + ' · ' + won.qty + ' ' + p.unit + ' · auction ' + won.id : ''}</Txt>
      <RefPill k="WINNING BID" v={won ? MB.money(store.aucCur(won)) : ''} s={15} />
      <Tap onPress={() => store.openDoc({ t: 'auction', aid: s.aid })} style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }}>
        <Icon d={IC.eye} size={15} color={c.goldInk} sw={2} circles={[[12, 12, 3]]} />
        <Txt s={13} w={600} c={c.goldInk}>View auction result certificate</Txt>
      </Tap>
      <NumberedSteps style={{ marginTop: 22 }} steps={['Pay the winning bid to release the lot', 'Track pickup, transit and delivery', 'Confirm receipt to complete the order']} />
    </FadeUp>
  );
}
