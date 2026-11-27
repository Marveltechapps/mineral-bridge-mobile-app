import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Empty, Grid2 } from '../../components/mb/kit';
import { mineralName, PRODUCTS } from '../../lib/mb4';
import { D } from '../../theme';
import { CatalogueState } from './CatalogueState';
import { SearchBox } from './CategoriesScreen';
import { byAvailable, ProductCard } from './productCard';

/** Lots of one mineral (reached from older links); same grid and cards as the Buy tab. */
export function LotsScreen() {
  const store = useStore(), s = store.state, q = s.search.trim().toLowerCase();
  let lots = PRODUCTS.filter(x => x.mineral === s.mineral);
  if (q) lots = lots.filter(x => (x.name + ' ' + x.form + ' ' + x.origin + ' ' + x.grade).toLowerCase().includes(q));
  lots = [...lots].sort(byAvailable);
  return (
    <View style={{ paddingTop: 4, paddingHorizontal: 16, paddingBottom: 26 }}>
      <SearchBox value={s.search} onChange={t => store.setState({ search: t })} placeholder={'Search ' + mineralName(s.mineral).toLowerCase() + ' lots'} label="Search these lots" />
      <T s={12} w={700} c={D.MUT} style={{ marginTop: 14, marginHorizontal: 2, marginBottom: 10 }}>{lots.length + (lots.length === 1 ? ' lot' : ' lots')}</T>
      {!PRODUCTS.length ? <CatalogueState what="lots" /> : lots.length ? <Grid2>{lots.map(p => <ProductCard key={p.id} store={store} p={p} />)}</Grid2>
        : <Empty icon="search" title="No lots found" msg="Try another mineral, form or country." cta="Clear search" onCta={() => store.setState({ search: '' })} />}
    </View>
  );
}
