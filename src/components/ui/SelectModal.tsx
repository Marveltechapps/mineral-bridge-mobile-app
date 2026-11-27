import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { D } from '../../theme';
import { Ic, T } from '../mb/base';
import { Press } from '../mb/kit';

/** Native option picker (replaces the HTML <select>), styled like the final design's bottom sheets. */
export function SelectModal({ open, title, options, value, onPick, onClose }: { open: boolean; title: string; options: { v: string; l: string }[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={st.back} onPress={onClose} accessibilityLabel="Close" />
      <View style={[st.panel, { paddingBottom: 16 + insets.bottom }]}>
        <View style={st.grip} />
        <T s={19} w={800}>{title}</T>
        <ScrollView style={{ maxHeight: 360, marginTop: 10 }}>
          {options.map(o => (
            <Press key={o.v} scale={0.99} role="radio" selected={o.v === value} onPress={() => { onPick(o.v); onClose(); }} style={st.row}>
              <T s={15} w={o.v === value ? 800 : 600} style={{ flex: 1 }}>{o.l}</T>
              {o.v === value ? <Ic name="check" s={16} c={D.G} w={2.6} /> : null}
            </Press>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  back: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,15,30,.5)' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: D.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 10, paddingHorizontal: 22 },
  grip: { width: 40, height: 5, borderRadius: 3, backgroundColor: D.BOR, alignSelf: 'center', marginBottom: 16 },
  row: { height: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: D.BOR, paddingHorizontal: 4 },
});
