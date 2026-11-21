import React from 'react';
import { useStore } from '../../context/AppStore';
import { Card } from '../../components/ui/Blocks';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

/** Empty / loading / error state for catalogue lists. The catalogue only ever comes from the API. */
export function CatalogueState({ what = 'lots' }: { what?: string }) {
  const store = useStore(), s = store.state;
  const loading = s.catalogueLoading || (!s.catalogueLoaded && !s.catalogueErr);
  return (
    <Card style={{ marginTop: 18, padding: 22, alignItems: 'center' }}>
      <Txt s={15} w={600} center>{loading ? 'Loading ' + what + '…' : s.catalogueErr ? 'We could not load ' + what : 'No ' + what + ' listed yet'}</Txt>
      <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>{loading ? 'Fetching the latest verified listings.' : s.catalogueErr ? s.catalogueErr : 'New verified listings appear here as soon as they are published.'}</Txt>
      {!loading ? <Tap onPress={() => { void store.task(store.remote.loadCatalogue(true)); }} style={{ marginTop: 14 }}><Txt s={13.5} w={600} c={c.goldInk}>Try again</Txt></Tap> : null}
    </Card>
  );
}
