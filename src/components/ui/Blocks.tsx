// Reusable building blocks that appear across the design's screens.
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import type { ImageSourcePropType, KeyboardTypeOptions, StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../../theme';
import { Icon, IC } from './Icon';
import { Pop, Slide } from './Motion';
import { Tap } from './Tap';
import { family, Label, Txt } from './Txt';

type S = StyleProp<ViewStyle>;
const c = colors;

/** White rounded card: radius 20, 1px #E4E2DB border. */
export function Card({ style, children, r = 20, pad }: { style?: S; children?: React.ReactNode; r?: number; pad?: ViewStyle['padding'] }) {
  return <View style={[st.card, { borderRadius: r }, pad !== undefined ? { padding: pad } : null, style]}>{children}</View>;
}
/** Card with the list padding used everywhere (2px 15px). */
export function ListCard({ style, children }: { style?: S; children?: React.ReactNode }) {
  return <Card style={[{ paddingVertical: 2, paddingHorizontal: 15 }, style]}>{children}</Card>;
}

/** Section label: mono 10.5 with margin 20px 4px 8px by default. */
export function Sec({ children, mt = 20, mb = 8, mh = 4, c: col, right }: { children: React.ReactNode; mt?: number; mb?: number; mh?: number; c?: string; right?: React.ReactNode }) {
  if (right) return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: mt, marginBottom: mb, marginHorizontal: mh }}><Label c={col}>{children}</Label>{right}</View>;
  return <Label c={col} style={{ marginTop: mt, marginBottom: mb, marginHorizontal: mh }}>{children}</Label>;
}

/** Key/value row (13.5px, label #6B6A70, value 600 right-aligned). */
export function KV({ k, v, mono, line = true, vColor, gap = 10, keyNone }: { k: string; v: React.ReactNode; mono?: boolean; line?: boolean | string; vColor?: string; gap?: number; keyNone?: boolean }) {
  const border = line === false ? 'transparent' : typeof line === 'string' ? line : c.hair;
  return (
    <View style={[st.kv, { borderBottomColor: border, gap }]}>
      <Txt s={13.5} c={c.muted} style={keyNone ? { flexShrink: 0 } : undefined}>{k}</Txt>
      {typeof v === 'string' ? <Txt s={13.5} w={600} mono={mono} c={vColor || c.ink} right style={st.kvV}>{v}</Txt> : v}
    </View>
  );
}

export function ErrBox({ children, mt = 12, style }: { children: React.ReactNode; mt?: number; style?: S }) {
  return <View accessibilityRole="alert" style={[st.err, { marginTop: mt }, style]}><Txt s={13} w={500} c={c.red}>{children}</Txt></View>;
}
export function InfoBox({ children, mt = 12, style, bg = c.chip, fg = c.ink2 }: { children: React.ReactNode; mt?: number; style?: S; bg?: string; fg?: string }) {
  return <View style={[st.info, { marginTop: mt, backgroundColor: bg }, style]}><Txt s={12.5} c={fg} lh={1.5}>{children}</Txt></View>;
}
export function FieldErr({ children }: { children: React.ReactNode }) {
  return <Txt s={12} c={c.red} style={{ marginTop: 5, marginHorizontal: 4 }}>{children}</Txt>;
}

/** Pill chip used for single-choice options (9px 13px, radius 99). */
export function Chip({ label, on, onPress, pad = [9, 13], s = 13, style }: { label: string; on: boolean; onPress: () => void; pad?: [number, number]; s?: number; style?: S }) {
  return (
    <Tap role="radio" selected={on} onPress={onPress} style={[st.chip, { paddingVertical: pad[0], paddingHorizontal: pad[1], backgroundColor: on ? c.ink : c.white, borderColor: on ? c.ink : c.line }, style]}>
      <Txt s={s} w={600} c={on ? c.paper : c.ink}>{label}</Txt>
    </Tap>
  );
}
export function Chips({ list, value, onPick }: { list: string[]; value: string; onPick: (v: string) => void }) {
  return <View style={st.wrap}>{list.map(v => <Chip key={v} label={v} on={value === v} onPress={() => onPick(v)} />)}</View>;
}

/** Checkbox row: 22px square box, label 13.5/1.45. */
export function CheckRow({ on, onPress, children, r = 20, pv = 14, s = 13.5, style }: { on: boolean; onPress: () => void; children: React.ReactNode; r?: number; pv?: number; s?: number; style?: S }) {
  return (
    <Tap role="checkbox" checked={on} onPress={onPress} style={[st.check, { borderRadius: r, paddingVertical: pv }, style]}>
      <View style={[st.box, { backgroundColor: on ? c.ink : c.white }]}><Icon d={IC.check} size={12} color="#fff" sw={3.2} /></View>
      <Txt s={s} lh={1.45} style={{ flex: 1 }}>{children}</Txt>
    </Tap>
  );
}

/** iOS-style switch: 44×26, knob 22. */
export function Toggle({ on, spring }: { on: boolean; spring?: boolean }) {
  return (
    <View style={[st.toggle, { backgroundColor: on ? c.ink : c.dash }]}>
      <Slide to={on ? 18 : 0} spring={spring} dur={250} style={st.knob} />
    </View>
  );
}

/** Radio indicator: 22px circle; on = 7px #121214 ring. */
export function Radio({ on }: { on: boolean }) {
  return <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: on ? 7 : 1.5, borderColor: on ? c.ink : c.radioOff }} />;
}

/** Selectable card with radio (border 1.5px, shadow when selected). */
export function OptionCard({ on, onPress, title, sub, left, titleS = 14.5 }: { on: boolean; onPress: () => void; title: string; sub?: string; left?: React.ReactNode; titleS?: number }) {
  return (
    <Tap role="radio" selected={on} scale={0.985} onPress={onPress} style={[st.opt, { borderColor: on ? c.ink : c.line, boxShadow: on ? '0 6px 18px rgba(18,18,20,.10)' : undefined }]}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt s={titleS} w={600}>{title}</Txt>
        {sub ? <Txt s={titleS === 14 ? 12 : 12.5} c={c.muted} lh={1.4} style={{ marginTop: 2 }}>{sub}</Txt> : null}
      </View>
      <Radio on={on} />
    </Tap>
  );
}

type FieldProps = Omit<TextInputProps, 'style' | 'onChangeText'> & {
  value: string;
  onChangeText: (t: string) => void;
  style?: StyleProp<TextStyle>;
  wrap?: S;
  err?: boolean;
  h?: number;
  multiline?: boolean;
  mono?: boolean;
  serif?: boolean;
  fs?: number;
  focusGold?: boolean;
  bg?: string;
  keyboard?: KeyboardTypeOptions;
};

/** Text input: 52px tall, radius 14, 1px border that turns #121214 on focus. */
export function Field({ value, onChangeText, style, err, h = 52, multiline, mono, serif, fs, focusGold, bg = c.white, keyboard, ...rest }: FieldProps) {
  const [focus, setFocus] = useState(false);
  const size = fs || (multiline ? 14 : 15);
  const border = err ? c.red : focus ? (focusGold ? c.gold : c.ink) : c.line;
  const input = (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      placeholderTextColor="#8E8D93"
      multiline={multiline}
      keyboardType={keyboard}
      textAlignVertical={multiline ? 'top' : 'center'}
      allowFontScaling={false}
      style={[
        st.field,
        { height: multiline ? undefined : h, minHeight: multiline ? 84 : undefined, paddingVertical: multiline ? 12 : 0, borderColor: border, backgroundColor: bg, fontSize: size, fontFamily: serif ? family(400, false, true) : family(400, mono), lineHeight: multiline ? size * 1.45 : undefined },
        style,
      ]}
      {...rest}
    />
  );
  if (!focusGold) return input;
  // The gold focus ring (CSS box-shadow 0 0 0 4px) is a padded wrapper behind the input: changing
  // boxShadow on the TextInput itself swaps its background drawable on Android, which resets the
  // input's padding while it is focused.
  return <View style={{ margin: -4, padding: 4, borderRadius: 18, backgroundColor: focus ? 'rgba(217,180,86,.18)' : 'transparent' }}>{input}</View>;
}

/** Small mono label above a field (9.5px) + input + optional error. */
export function LabeledField({ label, value, onChangeText, err, placeholder, keyboard, ff, bg, h, locked }: { label: string; locked?: boolean; value: string; onChangeText: (t: string) => void; err?: string; placeholder?: string; keyboard?: KeyboardTypeOptions; ff?: 'mono'; bg?: string; h?: number }) {
  return (
    <View>
      <Label s={9.5} style={{ marginHorizontal: 4, marginBottom: 5 }}>{label}</Label>
      <Field accessibilityLabel={label} editable={!locked} value={value} onChangeText={onChangeText} err={!!err} placeholder={placeholder} keyboard={keyboard} mono={ff === 'mono'} bg={bg} h={h} fs={bg ? 14.5 : undefined} />
      {err ? <FieldErr>{err}</FieldErr> : null}
    </View>
  );
}

/** Segmented control (track #E7E5DF). */
export function Segmented({ items, r = 16, h = 40, ir = 12, s = 13.5, style }: { items: { label: React.ReactNode; on: boolean; onPress: () => void }[]; r?: number; h?: number; ir?: number; s?: number; style?: S }) {
  return (
    <View style={[st.seg, { borderRadius: r }, style]}>
      {items.map((t, i) => (
        <Tap key={i} role="tab" selected={t.on} onPress={t.onPress} style={[st.segItem, { height: h, borderRadius: ir, backgroundColor: t.on ? c.ink : 'transparent' }]}>
          {typeof t.label === 'string' ? <Txt s={s} w={600} c={t.on ? c.paper : c.muted} lines={1}>{t.label}</Txt> : t.label}
        </Tap>
      ))}
    </View>
  );
}

/** Dark order summary card used at the top of order-step screens. */
export function SummaryCard({ id, title, sub, style, children }: { id: string; title: string; sub?: string; style?: S; children?: React.ReactNode }) {
  return (
    <View style={[st.summary, style]}>
      <Label c={c.faint}>{id}</Label>
      <Txt s={15} w={600} c={c.paper} style={{ marginTop: 6 }}>{title}</Txt>
      {sub ? <Txt s={12.5} c={c.soft} style={{ marginTop: 3 }}>{sub}</Txt> : null}
      {children}
    </View>
  );
}

/** Status pill. */
export function Pill({ label, bg, fg, s = 11, pad = [3, 9], style }: { label: string; bg: string; fg: string; s?: number; pad?: [number, number]; style?: S }) {
  return <View style={[{ paddingVertical: pad[0], paddingHorizontal: pad[1], borderRadius: 99, backgroundColor: bg }, style]}><Txt s={s} w={600} c={fg}>{label}</Txt></View>;
}

export function Chevron() { return <Icon d={IC.chevron} size={15} color={c.chevron} sw={2} linejoin={false} />; }

/** Document row: icon, name + file, preview (eye) and download buttons. */
export function DocRow({ n, f, onOpen, onDownload }: { n: string; f: string; onOpen: () => void; onDownload: () => void }) {
  return (
    <View style={st.docRow}>
      <View style={st.docIcon}><Icon d={IC.doc} size={15} color={c.ink2} sw={1.9} /></View>
      <Tap onPress={onOpen} style={{ flex: 1, minWidth: 0 }}>
        <Txt s={13.5} w={600} lines={1}>{n}</Txt>
        <Txt s={11.5} c={c.muted2} lines={1} style={{ marginTop: 2 }}>{f}</Txt>
      </Tap>
      <Tap onPress={onOpen} label="Preview" style={st.docBtn}><Icon d={IC.eye} size={15} color={c.ink} sw={2} circles={[[12, 12, 3]]} /></Tap>
      <Tap onPress={onDownload} label="Download" style={[st.docBtn, { backgroundColor: c.ink, borderWidth: 0 }]}><Icon d={IC.download} size={15} color={c.gold} sw={2} /></Tap>
    </View>
  );
}
export function DocList({ docs }: { docs: { n: string; f: string; tap: () => void; dl: () => void }[] }) {
  return <ListCard>{docs.map((d, i) => <DocRow key={i} n={d.n} f={d.f} onOpen={d.tap} onDownload={d.dl} />)}</ListCard>;
}

/** Numbered step rows (ink circle with gold mono number). */
export function NumberedSteps({ steps, style }: { steps: string[]; style?: S }) {
  return (
    <Card style={[{ paddingVertical: 4, paddingHorizontal: 16 }, style]}>
      {steps.map((t, i) => (
        <View key={i} style={[st.numRow, { borderBottomColor: i === steps.length - 1 ? 'transparent' : c.hair }]}>
          <NumDot n={i + 1} />
          <Txt s={13.5} w={500} style={{ flex: 1 }}>{t}</Txt>
        </View>
      ))}
    </Card>
  );
}
export function NumDot({ n }: { n: number | string }) {
  return <View style={st.numDot}><Txt mono s={12} c={c.gold}>{String(n)}</Txt></View>;
}

/** 84px success badge (ink circle, gold icon) with pop animation. */
export function SuccessBadge({ d = IC.check, sw = 2.6, size = 84, iconSize = 34 }: { d?: string; sw?: number; size?: number; iconSize?: number }) {
  return (
    <Pop style={{ alignSelf: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={d} size={iconSize} color={c.gold} sw={sw} />
      </View>
    </Pop>
  );
}
/** Inline reference pill (REF  MB-…). */
export function RefPill({ k, v, s = 14 }: { k: string; v: string; s?: number }) {
  return (
    <View style={st.refPill}>
      <Label>{k}</Label>
      <Txt mono s={s} w={600}>{v}</Txt>
    </View>
  );
}

/** Search bar (48px, radius 16). */
export function SearchBar({ value, onChangeText, placeholder, onClear, label = 'Search' }: { value: string; onChangeText: (t: string) => void; placeholder: string; onClear?: () => void; label?: string }) {
  return (
    <View style={st.search}>
      <Icon d={IC.search} size={17} color={c.muted2} sw={2} linejoin={false} circles={[[11, 11, 7]]} />
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8E8D93" allowFontScaling={false} style={st.searchIn} />
      {value && onClear ? <Tap onPress={onClear}><Txt s={12.5} w={600} c={c.muted}>Clear</Txt></Tap> : null}
    </View>
  );
}

/** Background image filling a rounded box (CSS background-size: cover). */
export function BgImage({ source, style, children, imageStyle }: { source: ImageSourcePropType; style?: S; children?: React.ReactNode; imageStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Image source={source} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, imageStyle as object]} />
      {children}
    </View>
  );
}

/** Dashed demo box used for simulated counterparty actions. */
export function DemoBox({ title, children, r = 18, pad = 12, style }: { title: string; children: React.ReactNode; r?: number; pad?: number; style?: S }) {
  return (
    <View style={[{ borderRadius: r, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dash, padding: pad }, style]}>
      <Label s={9.5}>{title}</Label>
      {children}
    </View>
  );
}
export function SoftBtn({ label, onPress, h = 42, bg = c.chip, fg = c.ink, s = 13, style }: { label: string; onPress: () => void; h?: number; bg?: string; fg?: string; s?: number; style?: S }) {
  return <Tap onPress={onPress} style={[{ height: h, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}><Txt s={s} w={600} c={fg}>{label}</Txt></Tap>;
}
/** Contact strip: Phone · SMS · Email · WhatsApp · Chat (5 equal columns). */
export function ContactGrid({ items }: { items: { l: string; tap: () => void }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {items.map(x => <Tap key={x.l} onPress={x.tap} style={st.contact}><Txt s={11.5} w={600} lines={1}>{x.l}</Txt></Tap>)}
    </View>
  );
}

export const st = StyleSheet.create({
  card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  kvV: { flexShrink: 1 },
  err: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.redBg },
  info: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  chip: { borderRadius: 99, borderWidth: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  check: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingHorizontal: 15, backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 44, height: 26, borderRadius: 13 },
  knob: { position: 'absolute', top: 2, left: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: c.white, boxShadow: '0 1px 3px rgba(0,0,0,.2)' },
  opt: { paddingVertical: 13, paddingHorizontal: 15, borderRadius: 18, backgroundColor: c.white, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1.5 },
  field: { width: '100%', borderRadius: 14, borderWidth: 1, paddingHorizontal: 15, color: c.ink },
  seg: { flexDirection: 'row', gap: 3, padding: 4, backgroundColor: c.track },
  segItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  summary: { padding: 16, borderRadius: 22, backgroundColor: c.ink },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: c.hair },
  docIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  docBtn: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
  numRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  numDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
  refPill: { flexDirection: 'row', alignSelf: 'center', gap: 8, alignItems: 'center', marginTop: 16, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 99, backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  search: { height: 48, borderRadius: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  searchIn: { flex: 1, minWidth: 0, fontSize: 14.5, fontFamily: 'Geist-Regular', color: c.ink, paddingVertical: 0 },
  contact: { flex: 1, minWidth: 0, height: 44, borderRadius: 14, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
});
