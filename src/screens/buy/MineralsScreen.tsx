import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { catIm, ImFill, imBg } from '../../components/mb/art';
import { Card, Row, Section } from '../../components/mb/kit';
import { CATS, PRODUCTS } from '../../lib/mb4';
import { CAT_TINT, catKey, D } from '../../theme';
import { CatalogueState } from './CatalogueState';

/** Minerals of one category (reached from older links). */
export function MineralsScreen() {
  const store = useStore(), s = store.state;
  const cat = CATS.find(x => x.id === s.cat) || CATS[0];
  if (!cat) return <View style={{ paddingHorizontal: 16 }}><CatalogueState what="minerals" /></View>;
  const im = catIm(cat.id);
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 26 }}>
      <View style={{ height: 120, borderRadius: 20, overflow: 'hidden', backgroundColor: imBg(im, CAT_TINT[catKey(cat.id)]), alignItems: 'center', justifyContent: 'center' }}><ImFill im={im} inset={0.7} /></View>
      <Section t="Minerals" />
      <Card>
        {cat.minerals.map(([id, name], i) => {
          const n = PRODUCTS.filter(x => x.mineral === id).length;
          return (
            <Row key={id} last={i === cat.minerals.length - 1} pv={13} onPress={() => store.go('lots', { mineral: id, search: '' })}>
              <T s={14} w={800} style={{ flex: 1 }}>{name}</T>
              <T s={12} w={700} c={D.GD}>{n ? n + (n === 1 ? ' lot' : ' lots') : 'No lots yet'}</T>
              <Ic name="chevronRight" s={16} c={D.MUT} />
            </Row>
          );
        })}
      </Card>
    </View>
  );
}
