import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Chevron, SearchBar } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { CATS, mineralName, PRODUCTS } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { lotCard } from './lotCard';

export function CategoriesScreen() {
  const store = useStore(), s = store.state;
  const q = s.search.trim().toLowerCase();
  const global = q ? PRODUCTS.filter(x => (x.name + ' ' + mineralName(x.mineral) + ' ' + x.form).toLowerCase().includes(q)).slice(0, 12).map(x => lotCard(store, x)) : [];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SearchBar value={s.search} onChangeText={t => store.setState({ search: t })} onClear={() => store.setState({ search: '' })} placeholder="Search all minerals and lots" />
      {global.length ? (
        <>
          <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 8 }}>RESULTS</Label>
          <View style={{ gap: 8 }}>
            {global.map(x => (
              <Tap key={x.id} scale={0.985} onPress={x.tap} style={{ opacity: x.opacity }}>
                <Card style={st.result}>
                  <Image source={x.img} style={st.resultImg} />
                  <View style={{ flex: 1, minWidth: 0, paddingTop: 2, paddingHorizontal: 2 }}>
                    <Txt mono s={10} ls={0.4} c={c.muted2}>{x.id}</Txt>
                    <Txt s={14.5} w={600} lh={1.3} lines={1} style={{ marginTop: 2 }}>{x.name}</Txt>
                    <Txt s={12.5} w={500} c={c.ink2} style={{ marginTop: 4 }}>{x.qty}</Txt>
                    <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{x.origin}</Txt>
                    <View style={[st.lab, { backgroundColor: x.labBg }]}><Txt s={11} w={600} lh={1.4} c={x.labFg} lines={1}>{x.grade} · {x.lab}</Txt></View>
                  </View>
                </Card>
              </Tap>
            ))}
          </View>
        </>
      ) : null}
      {q && !global.length ? (
        <Card style={{ marginTop: 18, padding: 22, alignItems: 'center' }}>
          <Txt s={15} w={600} center>No minerals match “{s.search}”</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>Try a mineral name such as gold, copper or lithium.</Txt>
          <Tap onPress={() => store.setState({ search: '' })} style={{ marginTop: 14 }}><Txt s={13.5} w={600} c={c.goldInk}>Clear search</Txt></Tap>
        </Card>
      ) : null}
      {!q ? (
        <View style={{ gap: 10, marginTop: 14 }}>
          {CATS.map(cat => (
            <Tap key={cat.id} scale={0.985} onPress={() => store.go('minerals', { cat: cat.id, search: '' })}>
              <Card style={st.cat}>
                <Image source={imgFor(cat.img)} style={st.catImg} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt s={15} w={600}>{cat.name}</Txt>
                  <Txt s={12} c={c.muted} lh={1.4} style={{ marginTop: 3 }}>{cat.minerals.map(m => m[1]).join(' · ')}</Txt>
                  <Txt mono s={11} c={c.goldInk} style={{ marginTop: 5 }}>{PRODUCTS.filter(x => cat.minerals.some(([m]) => m === x.mineral)).length + ' lots'}</Txt>
                </View>
                <Chevron />
              </Card>
            </Tap>
          ))}
        </View>
      ) : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  result: { padding: 10, flexDirection: 'row', gap: 12 },
  resultImg: { width: 86, height: 86, borderRadius: 14 },
  lab: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 7, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99 },
  cat: { padding: 10, flexDirection: 'row', gap: 13, alignItems: 'center' },
  catImg: { width: 72, height: 72, borderRadius: 14 },
});
