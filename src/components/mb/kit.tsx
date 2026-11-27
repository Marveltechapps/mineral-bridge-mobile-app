// Building blocks of the final design (the prototype's btn, hdr, label, input, alert, check, radioCard, section,
// cta, cta2, spinner, empty, card, kv, chips, field, contactRow, pageTitle, iconBtn and switch helpers).
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { AccessibilityRole, KeyboardTypeOptions, PressableProps, StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { D, SHADOW } from '../../theme';
import { Ic, jakarta, Rise, T } from './base';
import { Thumb } from './art';
import type { Im } from './art';

type S = StyleProp<ViewStyle>;

/* ---------------------------------------------------------------- press feedback (button:active scale .97) */

type PressProps = Omit<PressableProps, 'style'> & { style?: S; scale?: number; role?: AccessibilityRole; label?: string; checked?: boolean; selected?: boolean };
export function Press({ style, scale = 0.97, role = 'button', label, checked, selected, children, ...rest }: PressProps) {
  const state = checked !== undefined || selected !== undefined ? { checked, selected } : undefined;
  return (
    <Pressable accessibilityRole={role} accessibilityLabel={label} accessibilityState={state} hitSlop={4}
      style={({ pressed }) => [style, pressed && scale ? { transform: [{ scale }] } : null]} {...rest}>
      {children}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- buttons */

export type BtnKind = 'primary' | 'dark' | 'ghost' | 'subtle' | 'danger' | 'gold';
const KIND: Record<BtnKind, [string, string, string | null]> = {
  primary: [D.G, D.white, null], dark: [D.INK, D.white, null], ghost: [D.white, D.G, D.BOR], subtle: [D.TINT, D.GD, null], danger: [D.dangerBg, D.DANGER, null], gold: [D.GOLD, D.G, null],
};

/** `btn(label, onClick, {kind, size, disabled, icon, full})`. */
export function Btn({ label, onPress, kind = 'primary', size, disabled, icon, full = true, style }: { label: string; onPress?: () => void; kind?: BtnKind; size?: 'sm'; disabled?: boolean; icon?: string; full?: boolean; style?: S }) {
  const k = KIND[kind], sm = size === 'sm';
  const fg = disabled ? D.white : k[1];
  return (
    <Press onPress={disabled ? undefined : onPress} disabled={disabled} accessibilityState={{ disabled: !!disabled }}
      style={[{
        width: full ? '100%' : undefined, alignSelf: full ? 'stretch' : 'flex-start', paddingVertical: sm ? 10 : 15, paddingHorizontal: sm ? 16 : 20, borderRadius: 14,
        backgroundColor: disabled ? D.disabled : k[0], borderWidth: k[2] ? 1 : 0, borderColor: k[2] || 'transparent',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: kind === 'primary' && !disabled ? SHADOW.primary : kind === 'gold' && !disabled ? SHADOW.gold : undefined,
      }, style]}>
      {icon ? <Ic name={icon} s={18} c={fg} w={2.2} /> : null}
      <T s={sm ? 13.5 : 15.5} w={800} c={fg} center>{label}</T>
    </Press>
  );
}

/** Plain text button (cta2's secondary action, "Skip", "Change"…). */
export function TextBtn({ label, onPress, c = D.MUT, s = 14, w = 800, style, pad = 11 }: { label: string; onPress?: () => void; c?: string; s?: number; w?: 600 | 700 | 800; style?: S; pad?: number }) {
  return <Press onPress={onPress} style={[{ padding: pad, alignItems: 'center' }, style]}><T s={s} w={w} c={c} center>{label}</T></Press>;
}

/** `cta(label, onClick, opts)`: bottom action at the end of the screen. */
export function Cta({ children, style }: { children: React.ReactNode; style?: S }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ paddingTop: 14, paddingHorizontal: 24, paddingBottom: 24 + insets.bottom, marginTop: 'auto' }, style]}>{children}</View>;
}
/** `cta2(l1, f1, l2, f2)`: primary button + text button. */
export function Cta2({ children, style }: { children: React.ReactNode; style?: S }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ paddingTop: 14, paddingHorizontal: 20, paddingBottom: 22 + insets.bottom, marginTop: 'auto', gap: 8 }, style]}>{children}</View>;
}

/* ---------------------------------------------------------------- header */

/** `hdr(title, {sub, prog, noBack, onBack, right})`. */
export function Hdr({ title, sub, prog, onBack, right }: { title: string; sub?: string; prog?: number; onBack?: (() => void) | null; right?: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: 'rgba(244,242,237,.92)', paddingTop: 6, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: prog ? 0 : 1, borderBottomColor: D.BOR, zIndex: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onBack ? (
          <Press label="Back" onPress={onBack} style={st.back}><Ic name="chevronLeft" s={20} c={D.INK} /></Press>
        ) : <View style={{ width: 38 }} />}
        <View style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
          <T s={17} w={800} lines={1} accessibilityRole="header">{title}</T>
          {sub ? <T s={12} w={600} c={D.MUT} lines={1} style={{ marginTop: 1 }}>{sub}</T> : null}
        </View>
        {right || <View style={{ width: 38 }} />}
      </View>
      {prog ? (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, paddingHorizontal: 6 }}>
          {[1, 2, 3].map(i => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= prog ? D.G : D.BOR }} />)}
        </View>
      ) : null}
    </View>
  );
}

/** `iconBtn(icon, onClick, badge, label)`: 40px square with an optional red count badge. */
export function IconBtn({ icon, onPress, badge, label }: { icon: string; onPress: () => void; badge?: number; label: string }) {
  return (
    <Press label={label} onPress={onPress} style={st.iconBtn}>
      <Ic name={icon} s={20} c={D.INK} />
      {badge ? <View style={st.badge}><T s={9.5} w={800} c={D.white}>{String(badge)}</T></View> : null}
    </Press>
  );
}

/* ---------------------------------------------------------------- text blocks */

/** `label(t, mt)`: field label (12.5 / 700, muted). */
export function FLabel({ t, mt = 16 }: { t: string; mt?: number }) {
  return <T s={12.5} w={700} c={D.MUT} style={{ marginTop: mt, marginBottom: 7 }}>{t}</T>;
}
/** `section(t)`: 12.5 / 800 muted heading. */
export function Section({ t, right }: { t: string; right?: React.ReactNode }) {
  if (right) return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginHorizontal: 2, marginBottom: 10 }}><T s={12.5} w={800} c={D.MUT}>{t}</T>{right}</View>;
  return <T s={12.5} w={800} c={D.MUT} style={{ marginTop: 22, marginHorizontal: 2, marginBottom: 10 }}>{t}</T>;
}
/** `pageTitle(t, sub)`. */
export function PageTitle({ t, sub, s = 23 }: { t: string; sub?: string; s?: number }) {
  return (
    <View>
      <T s={s} w={800} ls={-0.02} lh={1.15}>{t}</T>
      {sub ? <T s={13.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 8 }}>{sub}</T> : null}
    </View>
  );
}
/** `alert(msg)`: red rounded message. */
export function Alert({ msg, mt = 14 }: { msg?: string; mt?: number }) {
  if (!msg) return null;
  return <Rise dur={250} style={{ marginTop: mt }}><View accessibilityRole="alert" style={st.alert}><T s={12.5} w={700} c={D.DANGER} lh={1.45}>{msg}</T></View></Rise>;
}
/** Tinted note box (gold tint by default). */
export function Note({ children, bg = D.TINT, fg = D.GD, mt = 14, w = 700, style }: { children: React.ReactNode; bg?: string; fg?: string; mt?: number; w?: 600 | 700 | 800; style?: S }) {
  return <View style={[{ marginTop: mt, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: bg }, style]}><T s={12.5} w={w} c={fg} lh={1.45}>{children}</T></View>;
}
export function FieldErr({ msg }: { msg?: string }) {
  return msg ? <T s={11.5} w={700} c={D.DANGER} style={{ marginTop: 5 }}>{msg}</T> : null;
}

/* ---------------------------------------------------------------- inputs */

type InputProps = Omit<TextInputProps, 'style'> & { style?: StyleProp<TextStyle>; err?: boolean; w?: 600 | 700 | 800; keyboard?: KeyboardTypeOptions; wrap?: S };
/** `input(props)`: 50px white field, 1.5px border that turns navy on focus. */
export function Input({ style, err, w = 700, keyboard, multiline, wrap, ...rest }: InputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={wrap}>
      <TextInput
        placeholderTextColor={D.placeholder} allowFontScaling={false} keyboardType={keyboard} multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={[multiline ? st.area : st.input, { fontFamily: jakarta(multiline ? 600 : w), borderColor: focus ? D.G : err ? D.DANGER : D.BOR }, style]}
        {...rest}
      />
    </View>
  );
}

/** `field(obj, err, set, key, label, placeholder)`. */
export function Field({ label, value, onChange, err, placeholder, keyboard, mt = 12, editable, autoCapitalize }: { label: string; value: string; onChange: (t: string) => void; err?: string; placeholder?: string; keyboard?: KeyboardTypeOptions; mt?: number; editable?: boolean; autoCapitalize?: TextInputProps['autoCapitalize'] }) {
  return (
    <View>
      <FLabel t={label} mt={mt} />
      <Input accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} keyboard={keyboard} err={!!err} editable={editable} autoCapitalize={autoCapitalize} />
      <FieldErr msg={err} />
    </View>
  );
}

/* ---------------------------------------------------------------- selection */

/** `check(on, text, onClick)`: bordered checkbox row. */
export function Check({ on, text, onPress, mt = 16 }: { on: boolean; text: React.ReactNode; onPress: () => void; mt?: number }) {
  return (
    <Press role="checkbox" checked={on} onPress={onPress} style={[st.check, { marginTop: mt, borderColor: on ? D.G : D.BOR }]}>
      <View style={[st.box, on ? { backgroundColor: D.G, borderWidth: 0 } : null]}>{on ? <Ic name="check" s={14} c={D.white} w={3} /> : null}</View>
      <T s={13} w={600} lh={1.45} style={{ flex: 1 }}>{text}</T>
    </Press>
  );
}

/** `radioCard(on, name, sub, onClick)`. */
export function RadioCard({ on, name, sub, onPress }: { on: boolean; name: string; sub?: string; onPress: () => void }) {
  return (
    <Press role="radio" selected={on} onPress={onPress}
      style={[st.radioCard, { backgroundColor: on ? D.radioBg : D.white, borderColor: on ? D.G : D.BOR, boxShadow: on ? '0 8px 18px -12px rgba(20,40,75,.55)' : undefined }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={14.5} w={800}>{name}</T>
        {sub ? <T s={12} w={600} c={D.MUT} lh={1.4} style={{ marginTop: 2 }}>{sub}</T> : null}
      </View>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: on ? 7 : 1.5, borderColor: on ? D.G : D.radioOff, backgroundColor: D.white }} />
    </Press>
  );
}

/** `chips(list, val, set)`: wrapping single-choice pills. */
export function Chips({ list, value, onPick }: { list: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
      {list.map(v => <Chip key={v} label={v} on={value === v} onPress={() => onPick(v)} />)}
    </View>
  );
}
export function Chip({ label, on, onPress, pad = [9, 13], s = 12.5, off = D.INK, role = 'radio' }: { label: string; on: boolean; onPress: () => void; pad?: [number, number]; s?: number; off?: string; role?: 'radio' | 'tab' | 'button' }) {
  return (
    <Press role={role} selected={on} onPress={onPress} style={{ paddingVertical: pad[0], paddingHorizontal: pad[1], borderRadius: 999, borderWidth: 1, borderColor: on ? D.G : D.BOR, backgroundColor: on ? D.G : D.white }}>
      <T s={s} w={800} c={on ? D.white : off}>{label}</T>
    </Press>
  );
}
/** Horizontal scrolling chip row. */
export function ChipRow({ children, style, inset = 16 }: { children: React.ReactNode; style?: S; inset?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={[{ marginHorizontal: -inset, flexGrow: 0 }, style]} contentContainerStyle={{ gap: 7, paddingHorizontal: inset }}>
      {children}
    </ScrollView>
  );
}

/** Switch: 44×26 track, 20px knob (gold knob when `goldKnob`). */
export function Switch({ on, goldKnob }: { on: boolean; goldKnob?: boolean }) {
  const v = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => { Animated.timing(v, { toValue: on ? 1 : 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }, [v, on]);
  return (
    <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: on ? D.G : D.dash }}>
      <Animated.View style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: on && goldKnob ? D.GOLD : D.white, boxShadow: goldKnob ? undefined : '0 2px 4px rgba(0,0,0,.2)', transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) }] }} />
    </View>
  );
}

/** Pill track with a sliding navy thumb (Sign up / Sign in, Buying / Selling, Full / Partial). */
export function SegTrack({ items, value, onPick, pad = 4, py = 10, s = 13.5, shadow, bg = D.white }: { items: [string, string][]; value: string; onPick: (v: string) => void; pad?: number; py?: number; s?: number; shadow?: boolean; bg?: string }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, items.findIndex(i => i[0] === value));
  const v = useRef(new Animated.Value(idx)).current;
  useEffect(() => { Animated.timing(v, { toValue: idx, duration: 360, easing: Easing.bezier(0.65, 0.05, 0.36, 1), useNativeDriver: true }).start(); }, [v, idx]);
  const n = items.length, gap = 4, tw = w ? (w - 2 - pad * 2 - gap * (n - 1)) / n : 0;
  return (
    <View accessibilityRole="tablist" onLayout={e => setW(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', gap, backgroundColor: bg, borderWidth: 1, borderColor: D.BOR, borderRadius: 999, padding: pad, boxShadow: shadow ? '0 8px 20px -14px rgba(14,26,51,.5)' : undefined }}>
      {w ? <Animated.View style={{ position: 'absolute', top: pad, bottom: pad, left: pad, width: tw, borderRadius: 999, backgroundColor: D.G, boxShadow: shadow ? '0 6px 14px -8px rgba(20,40,75,.7)' : undefined, transform: [{ translateX: v.interpolate({ inputRange: [0, Math.max(1, n - 1)], outputRange: [0, (tw + gap) * Math.max(1, n - 1)] }) }] }} /> : null}
      {items.map(([id, l]) => (
        <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: value === id }} onPress={() => onPick(id)} style={{ flex: 1, paddingVertical: py, alignItems: 'center', borderRadius: 999 }}>
          <T s={s} w={800} c={value === id ? D.white : D.MUT}>{l}</T>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- containers */

/** `card(kids, style)`: white, 1px border, radius 18, padding 4/14. */
export function Card({ children, style }: { children?: React.ReactNode; style?: S }) {
  return <View style={[st.card, style]}>{children}</View>;
}
/** `kv(rows)`. Falsy rows are skipped. */
export function KV({ rows, style }: { rows: (false | null | undefined | '' | [string, React.ReactNode])[]; style?: S }) {
  const list = rows.filter(Boolean) as [string, React.ReactNode][];
  return (
    <Card style={style}>
      {list.map(([k, v], i) => (
        <View key={k + i} style={[st.kv, { borderBottomWidth: i < list.length - 1 ? 1 : 0 }]}>
          <T s={12.5} w={700} c={D.MUT}>{k}</T>
          {typeof v === 'string' || typeof v === 'number' ? <T s={12.5} w={800} right style={{ flexShrink: 1 }}>{String(v)}</T> : v}
        </View>
      ))}
    </Card>
  );
}
/** Divided list row inside a Card. */
export function Row({ children, last, style, onPress, pv = 11 }: { children: React.ReactNode; last?: boolean; style?: S; onPress?: () => void; pv?: number }) {
  const s2 = [{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, paddingVertical: pv, borderBottomWidth: last ? 0 : 1, borderBottomColor: D.BOR }, style];
  if (onPress) return <Press scale={0.99} onPress={onPress} style={s2}>{children}</Press>;
  return <View style={s2}>{children}</View>;
}
/** Rounded square icon tile (TINT background). */
export function IconTile({ icon, sz = 36, r = 11, bg = D.TINT, c = D.G, s = 18, w = 2 }: { icon: string; sz?: number; r?: number; bg?: string; c?: string; s?: number; w?: number }) {
  return <View style={{ width: sz, height: sz, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Ic name={icon} s={s} c={c} w={w} /></View>;
}
/** Document row (`file` tile, name, sub, chevron). */
export function DocLine({ n, f, onPress, last }: { n: string; f: string; onPress: () => void; last?: boolean }) {
  return (
    <Row last={last} onPress={onPress}>
      <IconTile icon="file" sz={34} r={10} c={D.GD} s={16} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={13} w={800}>{n}</T>
        <T s={11.5} w={600} c={D.MUT} lines={1}>{f}</T>
      </View>
      <Ic name="chevronRight" s={16} c={D.MUT} />
    </Row>
  );
}
/** Numbered steps card (TINT circles with gold numbers). */
export function Steps({ items }: { items: (string | [string, string])[] }) {
  return (
    <Card>
      {items.map((t, i) => (
        <Row key={i} last={i === items.length - 1} style={{ gap: 12, alignItems: Array.isArray(t) ? 'flex-start' : 'center' }}>
          <View style={st.num}><T s={12.5} w={800} c={D.GD}>{String(i + 1)}</T></View>
          {Array.isArray(t) ? (
            <View style={{ flex: 1 }}>
              <T s={13.5} w={800}>{t[0]}</T>
              <T s={12} w={600} c={D.MUT} lh={1.4} style={{ marginTop: 2 }}>{t[1]}</T>
            </View>
          ) : <T s={13.5} w={700} style={{ flex: 1 }}>{t}</T>}
        </Row>
      ))}
    </Card>
  );
}
/** Dashed demo box (simulated counterparty steps; development builds only). */
export function DemoBox({ title, children, style }: { title: string; children: React.ReactNode; style?: S }) {
  return (
    <View style={[{ marginTop: 12, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: D.sand, backgroundColor: 'rgba(255,255,255,.55)' }, style]}>
      <T s={10.5} w={800} c={D.MUT} ls={0.04}>{title}</T>
      <View style={{ marginTop: 10, gap: 8 }}>{children}</View>
    </View>
  );
}
/** Status pill. */
export function Pill({ label, bg, fg, s = 10.5, pad = [3, 8] }: { label: string; bg: string; fg: string; s?: number; pad?: [number, number] }) {
  return <View style={{ paddingVertical: pad[0], paddingHorizontal: pad[1], borderRadius: 999, backgroundColor: bg }}><T s={s} w={800} c={fg} lines={1}>{label}</T></View>;
}
/** REF / ORDER reference pill. */
export function RefPill({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 8, alignItems: 'center', marginTop: 16, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR }}>
      <T s={11} w={800} c={D.MUT}>{k}</T>
      <T s={13} w={800}>{v}</T>
    </View>
  );
}
/** `summary(o)`: thumbnail + id + title + quantity line. */
export function Summary({ im, id, title, sub }: { im: Im; id: string; title: string; sub: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 12 }}>
      <Thumb im={im} sz={54} />
      <View style={{ minWidth: 0, flex: 1 }}>
        <T s={11.5} w={800} c={D.MUT}>{id}</T>
        <T s={15} w={800}>{title}</T>
        <T s={12} w={600} c={D.MUT}>{sub}</T>
      </View>
    </View>
  );
}
/** `contactRow()`: Phone · SMS · Email · WhatsApp · Chat pills. */
export function ContactRow({ items }: { items: { l: string; tap: () => void }[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
      {items.map(x => <Press key={x.l} onPress={x.tap} style={st.contact}><T s={12.5} w={800}>{x.l}</T></Press>)}
    </View>
  );
}
/** `empty(icon, title, msg, cta, onCta)`. */
export function Empty({ icon, title, msg, cta, onCta }: { icon: string; title: string; msg?: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 30, gap: 8 }}>
      <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}><Ic name={icon} s={34} c={D.G} w={1.8} /></View>
      <T s={16.5} w={800} center>{title}</T>
      {msg ? <T s={13.5} w={600} c={D.MUT} lh={1.5} center style={{ maxWidth: 260 }}>{msg}</T> : null}
      {cta ? <View style={{ marginTop: 10 }}><Btn label={cta} onPress={onCta} full={false} size="sm" kind="subtle" /></View> : null}
    </View>
  );
}
/** `spinner(sz, col)`. */
export function Spinner({ sz = 18, col = D.G }: { sz?: number; col?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })); a.start(); return () => a.stop(); }, [v]);
  return <Animated.View style={{ width: sz, height: sz, borderRadius: sz / 2, borderWidth: sz / 9, borderColor: col + '33', borderTopColor: col, transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />;
}

/** Equal-width two-column grid. */
export function Grid2({ children, gap = 12 }: { children: React.ReactNode[]; gap?: number }) {
  const rows: React.ReactNode[][] = [];
  children.forEach((ch, i) => { if (i % 2 === 0) rows.push([]); rows[rows.length - 1].push(ch); });
  return (
    <View style={{ gap }}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap }}>
          <View style={{ flex: 1, minWidth: 0 }}>{r[0]}</View>
          <View style={{ flex: 1, minWidth: 0 }}>{r[1] || null}</View>
        </View>
      ))}
    </View>
  );
}

export const st = StyleSheet.create({
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,.7)', boxShadow: '0 4px 14px -6px rgba(14,26,51,.3)', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: D.DANGER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: D.BG },
  alert: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: D.dangerBg },
  input: { width: '100%', height: 50, backgroundColor: D.white, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 0, fontSize: 15, color: D.INK },
  area: { width: '100%', minHeight: 80, backgroundColor: D.white, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: D.INK, lineHeight: 20 },
  check: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: D.white, borderWidth: 1.5, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14 },
  box: { width: 22, height: 22, borderRadius: 7, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.radioOff, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioCard: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  card: { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, paddingVertical: 4, paddingHorizontal: 14 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderBottomColor: D.BOR },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center' },
  contact: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR },
});
