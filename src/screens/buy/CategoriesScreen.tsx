import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, jakarta, T } from '../../components/mb/base';
import { Chip, ChipRow, Empty, Grid2, IconBtn, Press } from '../../components/mb/kit';
import { CATS, catOf, mineralName, PRODUCTS } from '../../lib/mb4';
import { D } from '../../theme';
import { CatalogueState } from './CatalogueState';
import { byAvailable, ProductCard } from './productCard';

/** Search field of the Buy / Sell tops. */
export function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (t: string) => void; placeholder: string; label: string }) {
  return (
    <View style={st.search}>
      <Ic name="search" s={18} c={D.MUT} />
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={D.placeholder} allowFontScaling={false}
        autoCorrect={false} style={[st.searchIn, { fontFamily: jakarta(600) }]} />
      {value ? <Press label="Clear" onPress={() => onChange('')}><Ic name="x" s={16} c={D.MUT} /></Press> : null}
    </View>
  );
}

/** Sticky top of the Buy tab: title + cart, search and category chips. */
export function BuyTop() {
  const store = useStore(), s = store.state;
  const chips: [string, string][] = [['', 'All'], ...CATS.map(c => [c.id, c.name] as [string, string])];
  return (
    <View style={{ backgroundColor: 'rgba(244,242,237,.95)', paddingTop: 6, paddingHorizontal: 16, paddingBottom: 10, zIndex: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T s={20} w={800} accessibilityRole="header">Buy minerals</T>
        <IconBtn icon="cart" label="Cart" badge={s.cart.length} onPress={() => store.go('cart')} />
      </View>
      <SearchBox value={s.search} onChange={t => store.setState({ search: t })} placeholder="Search gold, cobalt, Nigeria…" label="Search minerals" />
      <ChipRow style={{ marginTop: 10 }}>
        {chips.map(([id, l]) => <Chip key={id || 'all'} label={l} on={(s.cat || '') === id} pad={[7, 13]} s={12} off={D.MUT} role="tab" onPress={() => store.setState({ cat: id })} />)}
      </ChipRow>
    </View>
  );
}

/** Buy tab (`scr_buy`): every lot as a two-column grid, filtered by category chip and search. */
export function CategoriesScreen() {
  const store = useStore(), s = store.state, q = s.search.trim().toLowerCase();
  let list = PRODUCTS.filter(x => !s.cat || (catOf(x.mineral) || { id: '' }).id === s.cat);
  if (q) list = list.filter(x => (x.name + ' ' + mineralName(x.mineral) + ' ' + x.form + ' ' + x.origin + ' ' + x.grade).toLowerCase().includes(q));
  list = [...list].sort(byAvailable);
  if (!PRODUCTS.length) return <View style={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 26 }}><CatalogueState what="lots" /></View>;
  return (
    <View style={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 26 }}>
      <T s={12} w={700} c={D.MUT} style={{ marginTop: 4, marginHorizontal: 2, marginBottom: 10 }}>{list.length + (list.length === 1 ? ' lot' : ' lots')}</T>
      {list.length ? <Grid2>{list.map(p => <ProductCard key={p.id} store={store} p={p} />)}</Grid2>
        : <Empty icon="search" title="No lots found" msg="Try another mineral, form or country." cta="Clear search" onCta={() => store.setState({ search: '', cat: '' })} />}
    </View>
  );
}

const st = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 14, paddingHorizontal: 14, marginTop: 10 },
  searchIn: { flex: 1, minWidth: 0, height: 44, fontSize: 14.5, color: D.INK, paddingVertical: 0 },
});
