/**
 * Building blocks that recur across the design. Each one reproduces a
 * specific markup pattern; screens pass the few values that vary.
 */
import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { images, type ImageName } from '../../../assets/images';
import { shadows } from '../../theme';
import { bg, chunk, shadow } from '../../utils/style';
import { Blip, Pop, ease } from './animations';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Children = { children?: React.ReactNode };
type Styled = { style?: StyleProp<ViewStyle> };

/** Upper-case section label (`10.5px / 600 / 0.5px / #7b839c`). */
export function SectionLabel({
  children,
  style,
}: Children & { style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

/** White card with the design's border; shadow defaults to the 1px hairline. */
export function Card({
  children,
  style,
  elevation = 'xs',
}: Children & Styled & { elevation?: keyof typeof shadows | 'none' }) {
  return (
    <View
      style={[
        styles.card,
        elevation !== 'none' ? { boxShadow: shadows[elevation] } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Blue "info" note with the circled-i icon. */
export function InfoNote({ children, style }: Children & Styled) {
  return (
    <View style={[styles.infoNote, style]}>
      <Icon name="info" size={18} color="#2563eb" />
      <Text style={styles.infoText} leading={1.5}>
        {children}
      </Text>
    </View>
  );
}

type CheckProps = {
  size: number;
  radius: number;
  iconSize: number;
  variant?: 'solid' | 'soft' | 'mint';
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/** Square check badge: solid green, or the soft green-on-mint variant. */
export function CheckBadge({
  size,
  radius,
  iconSize,
  variant = 'solid',
  strokeWidth = 3.5,
  style,
}: CheckProps) {
  const look =
    variant === 'solid'
      ? { backgroundColor: '#16a34a' }
      : variant === 'soft'
      ? { backgroundColor: '#edf7f1', borderWidth: 1, borderColor: '#cfe7d8' }
      : { backgroundColor: '#e8f4ec' };
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        look,
        style,
      ]}
    >
      <Icon
        name="check"
        size={iconSize}
        color={variant === 'solid' ? '#fff' : '#15803d'}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

/** Green "all good" note: solid check plus a line of reassurance. */
export function SuccessNote({
  children,
  style,
  checkRadius = 9,
  weight = '600',
  leading = 1.5,
  center = false,
}: Children &
  Styled & {
    checkRadius?: number;
    weight?: '600' | '700';
    leading?: number;
    center?: boolean;
  }) {
  return (
    <View style={[styles.successNote, center ? styles.center : null, style]}>
      <CheckBadge size={22} radius={checkRadius} iconSize={13} />
      <Text
        style={[styles.successText, { fontWeight: weight }]}
        leading={leading}
      >
        {children}
      </Text>
    </View>
  );
}

/** Rounded pill with a small caps label and a value ("ORDER ID  MB-2026-04871"). */
export function RefPill({
  label,
  value,
  style,
  labelStyle,
  flat = false,
  valueWeight = '600',
}: {
  label: string;
  value: string;
  flat?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  valueWeight?: '600' | '700';
} & Styled) {
  return (
    <View
      style={[
        styles.refPill,
        flat ? null : { boxShadow: shadows.hairline },
        style,
      ]}
    >
      <Text style={[styles.refLabel, labelStyle]}>{label}</Text>
      <Text style={[styles.refValue, { fontWeight: valueWeight }]}>
        {value}
      </Text>
    </View>
  );
}

/** The big green confirmation tick used on every "done" screen. */
export function SuccessHero() {
  return (
    <Pop duration={500} easing={ease.pop} style={styles.heroOuter}>
      <Pop
        duration={500}
        delay={140}
        easing={ease.pop}
        style={styles.heroInner}
      >
        <Icon name="check" size={32} color="#fff" strokeWidth={3} />
      </Pop>
    </Pop>
  );
}

export type NumberedStep = {
  n: string;
  title: string;
  sub: string;
  bg: string;
  fg: string;
  border: string;
  line: string;
};

/** Vertical "what happens next" timeline with numbered nodes. */
export function NumberedTimeline({
  steps,
  numberWeight = '600',
}: {
  steps: NumberedStep[];
  numberWeight?: '600' | '700';
}) {
  return (
    <>
      {steps.map(t => (
        <View key={t.n} style={styles.tlRow}>
          <View style={styles.tlRail}>
            <View
              style={[
                styles.tlNode28,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Text
                style={{ color: t.fg, fontSize: 12, fontWeight: numberWeight }}
              >
                {t.n}
              </Text>
            </View>
            <View
              style={[
                styles.tlLine,
                { minHeight: 14, backgroundColor: t.line },
              ]}
            />
          </View>
          <View style={styles.tlBody16}>
            <Text style={styles.tlTitle}>{t.title}</Text>
            <Text style={styles.tlSub} leading={1.45}>
              {t.sub}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
}

export type StatusStep = {
  title: string;
  sub: string;
  time: string;
  done: boolean;
  pending: boolean;
  active: boolean;
  bg: string;
  border: string;
  line: string;
  titleFg: string;
};

/** Tracking timeline: ticked, pulsing (active) and dotted (pending) nodes. */
export function StatusTimeline({
  steps,
  nodeRadius,
  lineMin,
  gap,
  titleSize,
  timeColor = '#8890ad',
  subColor = '#6b7290',
  pendingDot = '#c3cbe8',
}: {
  steps: StatusStep[];
  nodeRadius: number;
  lineMin: number;
  gap: number;
  titleSize: number;
  timeColor?: string;
  subColor?: string;
  pendingDot?: string;
}) {
  return (
    <>
      {steps.map(t => (
        <View key={t.title} style={styles.tlRow}>
          <View style={styles.tlRail}>
            <Blip active={t.active} duration={1600}>
              <View
                style={[
                  styles.tlNode26,
                  {
                    borderRadius: nodeRadius,
                    backgroundColor: t.bg,
                    borderColor: t.border,
                  },
                ]}
              >
                {t.done ? (
                  <Icon name="check" size={13} color="#fff" strokeWidth={3.5} />
                ) : null}
                {t.pending ? (
                  <View
                    style={[styles.pendingDot, { backgroundColor: pendingDot }]}
                  />
                ) : null}
              </View>
            </Blip>
            <View
              style={[
                styles.tlLine,
                { minHeight: lineMin, backgroundColor: t.line },
              ]}
            />
          </View>
          <View style={[styles.tlBodyFlex, { paddingBottom: gap }]}>
            <View style={styles.tlTitleRow}>
              <Text
                style={[
                  styles.tlStatusTitle,
                  { fontSize: titleSize, color: t.titleFg },
                ]}
              >
                {t.title}
              </Text>
              <Text style={[styles.tlTime, { color: timeColor }]}>
                {t.time}
              </Text>
            </View>
            <Text style={[styles.tlSub, { color: subColor }]} leading={1.5}>
              {t.sub}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
}

/** Review-card rows: small caps key on the left, right-aligned value. */
export function KeyValueRows({
  rows,
  valueWeight = '700',
}: {
  rows: { k: string; v: string }[];
  valueWeight?: '600' | '700';
}) {
  return (
    <>
      {rows.map(r => (
        <View key={r.k} style={styles.kvRow}>
          <Text style={styles.kvKey}>{r.k}</Text>
          <Text
            style={[styles.kvValue, { fontWeight: valueWeight }]}
            leading={1.45}
          >
            {r.v}
          </Text>
        </View>
      ))}
    </>
  );
}

/** Labelled read-only field (`height:52px`) as used by the delivery and intake forms. */
export function FieldBox({
  label,
  value,
  color = '#1a1f36',
  weight = '600',
  right,
  labelAccessory,
  note,
  onChangeText,
}: {
  label: string;
  value: string;
  color?: string;
  weight?: '600' | '700';
  right?: React.ReactNode;
  labelAccessory?: React.ReactNode;
  note?: string;
  onChangeText?: (value: string) => void;
}) {
  return (
    <View>
      <View style={styles.fieldLabelRow}>
        <SectionLabel>{label}</SectionLabel>
        {labelAccessory}
      </View>
      <View style={[styles.field, right ? styles.spread : null]}>
        {onChangeText ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            accessibilityLabel={label}
            style={{
              flex: 1,
              fontSize: 14.5,
              fontWeight: weight,
              color,
              padding: 0,
            }}
          />
        ) : (
          <Text style={{ fontSize: 14.5, fontWeight: weight, color }}>
            {value}
          </Text>
        )}
        {right}
      </View>
      {note ? (
        <Text style={styles.fieldNote} leading={1.5}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

/** Radio indicator: ring plus inner dot. */
export function RadioDot({
  size = 22,
  radius = 11,
  dot,
  fill,
  dotSize = 10,
}: {
  size?: number;
  radius?: number;
  dot: string;
  fill: string;
  dotSize?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: dot,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: fill,
        }}
      />
    </View>
  );
}

/** Small rounded status pill (`9.5–10.5px / 600 / letter-spaced`). */
export function Pill({
  label,
  bgColor,
  fg,
  border,
  size = 9.5,
  weight = '600',
  spacing = 0.4,
  padV = 3,
  padH = 8,
  style,
  children,
}: {
  label: string;
  bgColor: string;
  fg: string;
  border?: string;
  size?: number;
  weight?: '600' | '700';
  spacing?: number;
  padV?: number;
  padH?: number;
  children?: React.ReactNode;
} & Styled) {
  return (
    <View
      style={[
        styles.pill,
        bg(bgColor),
        { paddingVertical: padV, paddingHorizontal: padH },
        border ? { borderWidth: 1, borderColor: border } : null,
        style,
      ]}
    >
      {children}
      <Text
        style={{
          color: fg,
          fontSize: size,
          fontWeight: weight,
          letterSpacing: spacing,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Lays children out like a CSS grid with equal columns. */
export function Grid({
  columns,
  gap,
  rowGap = gap,
  children,
  style,
}: { columns: number; gap: number; rowGap?: number } & Children & Styled) {
  const items = React.Children.toArray(children);
  return (
    <View style={[{ gap: rowGap }, style]}>
      {chunk(items, columns).map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap }}>
          {row.map((item, j) => (
            <View key={j} style={styles.gridCell}>
              {item}
            </View>
          ))}
          {Array.from({ length: columns - row.length }).map((_, j) => (
            <View key={`pad${j}`} style={styles.gridCell} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * `background-image` + `background-size: cover`. Positioned `center` by
 * default; `align="right"` reproduces `background-position: center right`.
 */
export function Photo({
  name,
  style,
  imageStyle,
  children,
  dim,
  align = 'center',
  fit = 'contain',
}: {
  name: ImageName;
  imageStyle?: StyleProp<ImageStyle>;
  dim?: number;
  align?: 'center' | 'right';
  /** `contain` shows the whole mineral photo. `cover` is for decorative banners. */
  fit?: 'contain' | 'cover';
} & Children &
  Styled) {
  if (align === 'right')
    return (
      <RightAlignedPhoto name={name} style={style}>
        {children}
      </RightAlignedPhoto>
    );
  if (!children) {
    return (
      <Image
        source={images[name]}
        resizeMode={fit}
        style={[
          styles.photo,
          fit === 'contain' ? styles.contained : null,
          style as StyleProp<ImageStyle>,
          dim !== undefined ? { opacity: dim } : null,
        ]}
      />
    );
  }
  return (
    <ImageBackground
      source={images[name]}
      resizeMode={fit}
      style={[fit === 'contain' ? styles.contained : null, style]}
      imageStyle={imageStyle}
    >
      {children}
    </ImageBackground>
  );
}

/** Cover-scaled image anchored to the right edge and centred vertically. */
function RightAlignedPhoto({
  name,
  style,
  children,
}: { name: ImageName } & Children & Styled) {
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);
  const src = Image.resolveAssetSource(images[name]);
  let frame: ImageStyle | null = null;
  if (box && src.width && src.height) {
    const scale = Math.max(box.w / src.width, box.h / src.height);
    const w = src.width * scale;
    const h = src.height * scale;
    frame = {
      position: 'absolute',
      width: w,
      height: h,
      right: 0,
      top: (box.h - h) / 2,
    };
  }
  return (
    <View
      style={style}
      onLayout={e =>
        setBox({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }
    >
      {frame ? <Image source={images[name]} style={frame} /> : null}
      {children}
    </View>
  );
}

/** Absolute overlay painting a CSS gradient (image scrims). */
export function Scrim({ gradient, style }: { gradient: string } & Styled) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, bg(gradient), style]}
    />
  );
}

/** − value + stepper with g / kg / t unit chips (requirement and sell flows). */
export function QtyStepper({
  qty,
  qtyText,
  unitLabel,
  unit,
  onDec,
  onInc,
  onUnit,
  onChangeText,
  footnote,
}: {
  qty: number;
  qtyText?: string;
  unitLabel: string;
  unit: string;
  onDec: () => void;
  onInc: () => void;
  onUnit: (u: 'g' | 'kg' | 't') => void;
  onChangeText?: (value: string) => void;
  footnote?: string;
}) {
  const units: ['g' | 'kg' | 't', string][] = [
    ['g', 'Grams'],
    ['kg', 'Kilograms'],
    ['t', 'Tonnes'],
  ];
  return (
    <View style={styles.stepperCard}>
      <View style={styles.stepperRow}>
        <PressableScale
          onPress={onDec}
          accessibilityLabel="Decrease quantity"
          style={styles.stepDec}
        >
          <Icon name="minus" size={20} color="#1e2a5a" strokeWidth={2.5} />
        </PressableScale>
        <View style={styles.stepperCenter}>
          {onChangeText ? (
            <TextInput
              value={qtyText ?? String(qty)}
              onChangeText={onChangeText}
              accessibilityLabel="Quantity"
              keyboardType="numbers-and-punctuation"
              style={styles.qty}
            />
          ) : (
            <Text style={styles.qty}>{String(qty)}</Text>
          )}
          <Text style={styles.unitLabel}>{unitLabel}</Text>
        </View>
        <PressableScale
          onPress={onInc}
          accessibilityLabel="Increase quantity"
          style={styles.stepInc}
        >
          <Icon name="plus" size={20} color="#fff" strokeWidth={2.5} />
        </PressableScale>
      </View>
      <View style={styles.unitRow}>
        {units.map(([u, label]) => {
          const on = unit === u;
          return (
            <PressableScale
              key={u}
              onPress={() => onUnit(u)}
              accessibilityState={{ selected: on }}
              style={[
                styles.unitChip,
                {
                  backgroundColor: on ? '#1e2a5a' : '#fff',
                  borderColor: on ? '#1e2a5a' : '#dfe2e9',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: '600',
                  color: on ? '#fff' : '#6b7290',
                }}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      {footnote ? (
        <Text style={styles.stepperNote} leading={1.5}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

/** Underlined segment tabs with count pills (orders, auctions). */
export function SegmentTabs<T extends string>({
  tabs,
  value,
  onChange,
  spacing,
  pillWeight = '700',
  pressScale = 1,
}: {
  tabs: { id: T; label: string; count: string }[];
  value: T;
  onChange: (id: T) => void;
  spacing: number;
  pillWeight?: '600' | '700';
  pressScale?: number;
}) {
  return (
    <View style={styles.segments} accessibilityRole="tablist">
      {tabs.map(t => {
        const a = t.id === value;
        return (
          <PressableScale
            key={t.id}
            activeScale={pressScale}
            onPress={() => onChange(t.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: a }}
            style={[
              styles.segment,
              {
                marginRight: spacing,
                borderBottomColor: a ? '#1e2a5a' : 'transparent',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: a ? '#1a1f36' : '#8890ad',
              }}
            >
              {t.label}
            </Text>
            <View
              style={[
                styles.segmentPill,
                { backgroundColor: a ? '#1e2a5a' : '#f1f2f6' },
              ]}
            >
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: pillWeight,
                  color: a ? '#fff' : '#8890ad',
                }}
              >
                {t.count}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Dashed upload / add drop zone. */
export function DashedBox({
  children,
  style,
  onPress,
  pressScale = 0.977,
}: Children & Styled & { onPress?: () => void; pressScale?: number }) {
  if (onPress) {
    return (
      <PressableScale
        activeScale={pressScale}
        onPress={onPress}
        style={[styles.dashed, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={[styles.dashed, style]}>{children}</View>;
}

/** Tinted icon tile (`width/height`, radius, background, glyph colour). */
export function IconTile({
  size,
  radius,
  bgColor,
  color,
  d,
  name,
  iconSize,
  strokeWidth,
  style,
  shadowValue,
}: {
  size: number;
  radius: number;
  bgColor: string;
  color: string;
  d?: string;
  name?: React.ComponentProps<typeof Icon>['name'];
  iconSize: number;
  strokeWidth?: number;
  shadowValue?: string;
} & Styled) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        bg(bgColor),
        shadow(shadowValue),
        style,
      ]}
    >
      <Icon
        name={name}
        d={d}
        size={iconSize}
        color={color}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#7b839c',
  },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7ec' },
  center: { alignItems: 'center' },
  spread: { justifyContent: 'space-between' },
  infoNote: {
    backgroundColor: '#eff3fe',
    borderWidth: 1,
    borderColor: '#d6e2fb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 11,
  },
  infoText: { flex: 1, fontSize: 12.5, color: '#3b6fd4' },
  successNote: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 11,
  },
  successText: { flex: 1, fontSize: 12.5, color: '#15803d' },
  refPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
  },
  refValue: { fontSize: 13.5, fontWeight: '600', color: '#1e2a5a' },
  heroOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: 'center',
    backgroundColor: '#e8f4ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlRow: { flexDirection: 'row', gap: 13 },
  tlRail: { alignItems: 'center' },
  tlNode28: {
    width: 28,
    height: 28,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlNode26: {
    width: 26,
    height: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlLine: { width: 2, flex: 1 },
  tlBody16: { flex: 1, paddingBottom: 16 },
  tlBodyFlex: { flex: 1 },
  tlTitle: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  tlSub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  tlTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  tlStatusTitle: { flexShrink: 1, fontWeight: '600' },
  tlTime: { fontSize: 11, fontWeight: '600' },
  pendingDot: { width: 8, height: 8, borderRadius: 4 },
  kvRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  kvKey: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
    paddingTop: 2,
  },
  kvValue: {
    flexShrink: 1,
    fontSize: 13,
    color: '#1a1f36',
    textAlign: 'right',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  field: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    height: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  fieldNote: { fontSize: 12, color: '#8890ad', marginTop: 7 },
  pill: { borderRadius: 9999, flexDirection: 'row', alignItems: 'center' },
  gridCell: { flex: 1 },
  photo: { width: '100%' },
  contained: { backgroundColor: '#eef1f6' },
  stepperCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperCenter: { flex: 1, alignItems: 'center' },
  stepDec: {
    width: 46,
    height: 46,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#dcdfe7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInc: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: '#1e2a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -1,
    textAlign: 'center',
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
    marginTop: -2,
    textAlign: 'center',
  },
  unitRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  unitChip: {
    flex: 1,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperNote: { fontSize: 12, color: '#8890ad', marginTop: 13 },
  segments: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e5ec',
  },
  segment: {
    paddingTop: 11,
    paddingBottom: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 3,
    marginBottom: -1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  segmentPill: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 9999 },
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c9cdd8',
    backgroundColor: '#fafbfc',
  },
});
