import React from 'react';
import { useStore } from '../../context/AppStore';
import { Empty, Spinner } from '../../components/mb/kit';
import { View } from 'react-native';
import { T } from '../../components/mb/base';
import { D } from '../../theme';

/** Empty / loading / error state for catalogue lists. The catalogue only ever comes from the API. */
export function CatalogueState({ what = 'lots' }: { what?: string }) {
  const store = useStore(), s = store.state;
  const loading = s.catalogueLoading || (!s.catalogueLoaded && !s.catalogueErr);
  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
        <Spinner sz={28} />
        <T s={13.5} w={600} c={D.MUT}>{'Loading ' + what + '…'}</T>
      </View>
    );
  }
  return (
    <Empty icon={s.catalogueErr ? 'x' : 'box'} title={s.catalogueErr ? 'We could not load ' + what : 'No ' + what + ' listed yet'}
      msg={s.catalogueErr ? s.catalogueErr : 'New verified listings appear here as soon as they are published.'}
      cta="Try again" onCta={() => { void store.task(store.remote.loadCatalogue(true)); }} />
  );
}
