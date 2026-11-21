import React from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, SearchBar } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { mineralName, PRODUCTS } from '../../lib/mb4';
import { colors as c } from '../../theme';
import type { Product } from '../../types/mineralBridge';
import { CatalogueState } from './CatalogueState';
import { lotCard } from './lotCard';

const SORTS: [string, string][] = [['featured', 'Available first'], ['high', 'Most quantity'], ['low', 'Least quantity'], ['name', 'Name A–Z']];
const SORT: Record<string, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.avail > 0) - Number(a.avail > 0), high: (a, b) => b.avail - a.avail, low: (a, b) => a.avail - b.avail, name: (a, b) => a.name.localeCompare(b.name),
};
const COLS: [number, string, string][] = [[2, '2 columns', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'], [3, '3 columns', 'M3 4h5v5H3zM9.5 4h5v5h-5zM16 4h5v5h-5zM3 13h5v5H3zM9.5 13h5v5h-5zM16 13h5v5h-5z']];

export function LotsScreen() {
  const store = useStore(), s = store.state;
  const { width } = useWindowDimensions();
  const q = s.search.trim().toLowerCase();
  let lots = PRODUCTS.filter(x => x.mineral === s.mineral);
  const forms = ['All', ...new Set(lots.map(x => x.form))];
  if (s.fform !== 'All') lots = lots.filter(x => x.form === s.fform);
  if (s.labOnly) lots = lots.filter(x => x.lab);
  if (q) lots = lots.filter(x => (x.name + ' ' + x.form + ' ' + x.origin + ' ' + x.grade).toLowerCase().includes(q));
  lots = [...lots].sort(SORT[s.sort] || SORT.featured);
  const cols = s.cols === 3 ? 3 : 2, gap = cols === 3 ? 8 : 10;
  const cardW = Math.floor((width - 36 - gap * (cols - 1)) / cols);
  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Tap key={label} onPress={onPress} style={[st.chip, { backgroundColor: on ? c.ink : c.white, borderColor: on ? c.ink : c.line }]}>
      <Txt s={12.5} w={600} c={on ? c.paper : c.ink}>{label}</Txt>
    </Tap>
  );
  const sortLabel = (SORTS.find(x => x[0] === s.sort) || SORTS[0])[1];

  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SearchBar value={s.search} onChangeText={t => store.setState({ search: t })} onClear={() => store.setState({ search: '' })} placeholder="Search these lots" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -18 }} contentContainerStyle={{ gap: 7, paddingHorizontal: 18, paddingTop: 2, paddingBottom: 4 }}>
        {forms.map(f => chip(f, s.fform === f, () => store.setState({ fform: f })))}
        {chip('Has test report', s.labOnly, () => store.setState({ labOnly: !s.labOnly }))}
      </ScrollView>
      <View style={st.bar}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Txt serif s={24} lh={1}>{String(lots.length)}</Txt>
          <Txt s={13} c={c.muted}>{lots.length === 1 ? 'lot' : 'lots'}</Txt>
        </View>
        <View accessibilityRole="radiogroup" accessibilityLabel="Grid columns" style={st.colGroup}>
          {COLS.map(([n, label, icon]) => {
            const on = cols === n;
            return <Tap key={n} role="radio" selected={on} label={label} onPress={() => store.setState({ cols: n })} style={[st.colBtn, { backgroundColor: on ? c.white : 'transparent' }]}><Icon d={icon} size={16} color={on ? c.ink : c.muted2} sw={2} /></Tap>;
          })}
        </View>
        <Tap scale={0.97} onPress={() => store.setState({ sortOpen: !s.sortOpen })} style={st.sort} accessibilityState={{ expanded: !!s.sortOpen }}>
          <Icon d={IC.sort} size={15} sw={1.9} />
          <Txt s={13} w={600}>{sortLabel}</Txt>
          <View style={{ transform: [{ rotate: s.sortOpen ? '180deg' : '0deg' }] }}><Icon d={IC.chevronDown} size={13} color={c.muted} sw={2.2} /></View>
        </Tap>
        {s.sortOpen ? (
          <FadeUp dur={200} style={st.menu}>
            {SORTS.map(([id, l]) => (
              <Tap key={id} role="menuitem" onPress={() => store.setState({ sort: id, sortOpen: false })} style={st.opt} pressedStyle={{ backgroundColor: c.paper }}>
                <Txt s={14} w={s.sort === id ? 600 : 400}>{l}</Txt>
                {s.sort === id ? <Icon d={IC.check} size={15} color={c.goldInk} sw={2.6} /> : null}
              </Tap>
            ))}
          </FadeUp>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {lots.map(p => {
          const x = lotCard(store, p);
          return (
            <FadeUp key={x.id} dist={18} dur={350} style={{ width: cardW }}>
              <Tap scale={0.97} onPress={x.tap} style={[st.card, { opacity: x.opacity }]}>
                <View style={{ aspectRatio: 1, overflow: 'hidden' }}>
                  <Image source={x.img} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
                  {x.off ? <View style={st.sold}><Txt s={10} w={600} c={c.paper}>Sold out</Txt></View> : null}
                  {x.hasLabTag ? <View accessibilityLabel="Has test report" style={st.labTag}><Icon d={IC.check} size={11} color="#fff" sw={3.2} /></View> : null}
                </View>
                <View style={cols === 3 ? st.pad3 : st.pad2}>
                  <Txt mono s={9.5} ls={0.3} c={c.muted2}>{x.id}</Txt>
                  <Txt w={600} s={cols === 3 ? 12.5 : 14} lh={1.25} lines={2} style={{ marginTop: 2 }}>{x.name}</Txt>
                  <Txt s={11.5} w={500} c={c.ink2} lines={1} style={{ marginTop: 4 }}>{x.qty}</Txt>
                  {cols !== 3 ? (
                    <>
                      <Txt s={11} c={c.muted} lines={1} style={{ marginTop: 2 }}>{x.origin}</Txt>
                      <View style={[st.grade, { backgroundColor: x.labBg }]}><Txt s={10.5} w={600} lh={1.5} c={x.labFg} lines={1}>{x.grade}</Txt></View>
                    </>
                  ) : null}
                </View>
              </Tap>
            </FadeUp>
          );
        })}
      </View>
      {!lots.length && !PRODUCTS.length ? <CatalogueState what="lots" /> : null}
      {!lots.length && PRODUCTS.length ? (
        <Card style={{ padding: 24, alignItems: 'center' }}>
          <Txt s={15} w={600} center>{PRODUCTS.some(x => x.mineral === s.mineral) ? 'No lots match these filters.' : 'No ' + mineralName(s.mineral).toLowerCase() + ' lots are listed yet.'}</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>Clear filters or check back soon.</Txt>
          <Tap onPress={() => store.setState({ fform: 'All', labOnly: false, search: '', sort: 'featured' })} style={{ marginTop: 14 }}><Txt s={13.5} w={600} c={c.goldInk}>Reset filters</Txt></Tap>
        </Card>
      ) : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 99, borderWidth: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginVertical: 12, marginHorizontal: 2, zIndex: 20, elevation: 20 },
  colGroup: { flexDirection: 'row', padding: 3, borderRadius: 12, backgroundColor: c.track, marginLeft: 'auto' },
  colBtn: { width: 34, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingLeft: 14, paddingRight: 12, borderRadius: 99, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, boxShadow: '0 1px 2px rgba(18,18,20,.04)' },
  menu: { position: 'absolute', right: 0, top: 46, zIndex: 20, elevation: 20, width: 220, padding: 6, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, boxShadow: '0 14px 34px rgba(18,18,20,.16)' },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 42, paddingHorizontal: 12, borderRadius: 12 },
  card: { minWidth: 0, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, overflow: 'hidden' },
  sold: { position: 'absolute', left: 8, top: 8, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99, backgroundColor: c.ink },
  labTag: { position: 'absolute', right: 7, top: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.2)' },
  pad2: { paddingTop: 10, paddingHorizontal: 11, paddingBottom: 12, minWidth: 0 },
  pad3: { paddingTop: 8, paddingHorizontal: 9, paddingBottom: 10, minWidth: 0 },
  grade: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 6, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 99 },
});
