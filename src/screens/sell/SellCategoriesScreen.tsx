import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Chevron, ListCard, SearchBar } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { CATS, mineralName } from '../../lib/mb4';
import { colors as c } from '../../theme';

export function SellCategoriesScreen() {
  const store = useStore(), s = store.state, d = s.draft;
  const q = s.search.trim().toLowerCase();
  const groups = CATS.map(cat => ({ name: cat.name, items: cat.minerals.filter(([, n]) => !q || n.toLowerCase().includes(q)) })).filter(g => g.items.length);
  const none = !!q && !CATS.some(cat => cat.minerals.some(([, n]) => n.toLowerCase().includes(q)));
  const pick = (id: string) => { store.setState(x => ({ draft: { ...x.draft, mineral: id }, draftErr: {} })); store.go('sellForm'); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <Txt s={14} c={c.muted} lh={1.5} style={{ marginHorizontal: 4, marginBottom: 12 }}>Choose the mineral you want to sell to Mineral Bridge.</Txt>
      {s.user && s.user.role === 'buyer' ? (
        <View style={{ marginBottom: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.amberBg, borderWidth: 1, borderColor: c.amberLine }}>
          <Txt s={13} c={c.amberInk} lh={1.45}>Your account is set up for buying. You can prepare a sell request now and add a seller type when you submit.</Txt>
        </View>
      ) : null}
      {s.hasDraft && d.mineral ? (
        <View style={{ marginBottom: 12, paddingVertical: 14, paddingHorizontal: 15, borderRadius: 18, backgroundColor: c.ink }}>
          <Label c={c.gold}>DRAFT SAVED</Label>
          <Txt s={14} w={600} c={c.paper} style={{ marginTop: 5 }}>{mineralName(d.mineral || 'gold') + ' · ' + d.photos + (d.photos === 1 ? ' photo' : ' photos') + (d.qty ? ' · ' + d.qty + ' ' + d.unit : '')}</Txt>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
            <Tap onPress={() => store.go('sellForm')}><Txt s={13} w={600} c={c.gold}>Resume</Txt></Tap>
            <Tap onPress={() => store.setState({ sheet: 'discardDraft' })}><Txt s={13} w={600} c={c.soft}>Discard</Txt></Tap>
          </View>
        </View>
      ) : null}
      <SearchBar label="Search minerals" value={s.search} onChangeText={t => store.setState({ search: t })} placeholder="Search minerals" />
      {groups.map(g => (
        <View key={g.name}>
          <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 8 }}>{g.name}</Label>
          <ListCard>
            {g.items.map(([id, n]) => (
              <Tap key={id} onPress={() => pick(id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.hair }}>
                <Txt s={14.5} w={500} style={{ flex: 1 }}>{n}</Txt>
                <Chevron />
              </Tap>
            ))}
          </ListCard>
        </View>
      ))}
      {none ? <Card style={{ marginTop: 16, padding: 22, alignItems: 'center' }}><Txt s={14} c={c.muted} center>No mineral matches “{s.search}”.</Txt></Card> : null}
    </FadeUp>
  );
}
