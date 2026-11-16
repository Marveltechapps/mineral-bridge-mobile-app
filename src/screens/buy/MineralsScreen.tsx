import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { BgImage, Chevron, ListCard } from '../../components/ui/Blocks';
import { LinearFill } from '../../components/ui/Gradient';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { CATS, PRODUCTS } from '../../lib/mb4';
import { colors as c } from '../../theme';

/** Subcategories of a mineral category. */
export function MineralsScreen() {
  const store = useStore(), s = store.state;
  const cat = CATS.find(x => x.id === s.cat) || CATS[0];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <BgImage source={imgFor(cat.img)} style={{ height: 130, borderRadius: 22 }}>
        <LinearFill stops={[[0, 'rgba(18,18,20,.1)'], [1, 'rgba(18,18,20,.8)']]} />
        <Txt serif s={28} c={c.paper} style={{ position: 'absolute', left: 16, bottom: 14 }}>{cat.name}</Txt>
      </BgImage>
      <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 8 }}>SUBCATEGORIES</Label>
      <ListCard>
        {cat.minerals.map(([id, name]) => {
          const lots = PRODUCTS.filter(x => x.mineral === id), n = lots.length;
          const forms = [...new Set(lots.map(x => x.form))].join(' · ') || 'New listings soon';
          return (
            <Tap key={id} onPress={() => store.go('lots', { mineral: id, fform: 'All', labOnly: false, search: '', sort: 'featured' })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.hair }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt s={15} w={600}>{name}</Txt>
                <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{forms}</Txt>
              </View>
              <Txt mono s={11.5} c={c.goldInk}>{n ? n + (n === 1 ? ' lot' : ' lots') : 'No lots yet'}</Txt>
              <Chevron />
            </Tap>
          );
        })}
      </ListCard>
    </FadeUp>
  );
}
