import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as c } from '../../theme';
import { Icon, IC } from './Icon';
import { Tap } from './Tap';
import { Txt } from './Txt';

/** Native-style option picker (replaces the HTML <select>). */
export function SelectModal({ open, title, options, value, onPick, onClose }: { open: boolean; title: string; options: { v: string; l: string }[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={st.back} onPress={onClose} accessibilityLabel="Close" />
      <View style={[st.panel, { paddingBottom: 16 + insets.bottom }]}>
        <View style={st.grip} />
        <Txt serif s={26} lh={1.1}>{title}</Txt>
        <ScrollView style={{ maxHeight: 360, marginTop: 12 }}>
          {options.map(o => (
            <Tap key={o.v} role="radio" selected={o.v === value} onPress={() => { onPick(o.v); onClose(); }} style={st.row}>
              <Txt s={15} w={o.v === value ? 600 : 400} style={{ flex: 1 }}>{o.l}</Txt>
              {o.v === value ? <Icon d={IC.check} size={15} color={c.goldInk} sw={2.6} /> : null}
            </Tap>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  back: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,18,20,.42)' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 22 },
  grip: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.dash, alignSelf: 'center', marginBottom: 18 },
  row: { height: 46, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.hair, paddingHorizontal: 4 },
});
