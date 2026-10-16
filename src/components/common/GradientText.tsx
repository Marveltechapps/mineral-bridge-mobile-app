import React, { useId, useState } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextLayoutLine,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { fontFamilyFor } from '../../theme';
import { Text } from './Text';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * CSS paints a block element's background across its whole box, but an
   * inline span's only across its text. `block` reproduces the former.
   */
  block?: boolean;
  /** Gradient stops; defaults to the design's `.gold` class. */
  colors?: readonly [string, string];
  angle?: number;
};

type Box = { width: number; height: number };

/** CSS `linear-gradient(<angle>deg, …)` end points for a box, in user space. */
function gradientLine(angle: number, box: Box, originX = 0, originY = 0) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(box.width * dx) + Math.abs(box.height * dy)) / 2;
  const cx = originX + box.width / 2;
  const cy = originY + box.height / 2;
  return {
    x1: cx - dx * half,
    y1: cy - dy * half,
    x2: cx + dx * half,
    y2: cy + dy * half,
  };
}

/**
 * Text filled with the design's `.gold` gradient (`background-clip: text`).
 * The real text is laid out invisibly to get exact line metrics, then each
 * line is painted in SVG with the gradient spanning the same box CSS uses.
 */
export function GradientText({
  children,
  style,
  containerStyle,
  block = false,
  colors = ['#f7dd8e', '#c8962f'],
  angle = 135,
}: Props) {
  const id = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [box, setBox] = useState<Box | null>(null);
  const [lines, setLines] = useState<TextLayoutLine[]>([]);
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const fontSize = flat.fontSize ?? 16;
  const family =
    flat.fontFamily ??
    fontFamilyFor(flat.fontWeight, flat.fontStyle === 'italic');

  const gradientBox = (() => {
    if (!box) return null;
    if (block || lines.length === 0) return { box, x: 0, y: 0 };
    const width =
      Math.max(...lines.map(l => l.x + l.width)) -
      Math.min(...lines.map(l => l.x));
    // An inline box's background area is the font's content area (ascent + descent = 1.4em).
    const contentHeight = fontSize * 1.4;
    const top = lines[0].y + lines[0].ascender - fontSize * 1.05;
    return {
      box: { width, height: contentHeight * lines.length },
      x: Math.min(...lines.map(l => l.x)),
      y: top,
    };
  })();

  return (
    <View
      style={[block ? styles.block : null, containerStyle]}
      onLayout={e =>
        setBox({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      <Text
        style={[style, styles.hidden]}
        onTextLayout={e => setLines(e.nativeEvent.lines)}
        accessible
      >
        {children}
      </Text>
      {box && gradientBox && lines.length > 0 ? (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={box.width}
          height={box.height}
        >
          <Defs>
            <LinearGradient
              id={id}
              gradientUnits="userSpaceOnUse"
              {...gradientLine(
                angle,
                gradientBox.box,
                gradientBox.x,
                gradientBox.y,
              )}
            >
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          {lines.map((line, i) => (
            <SvgText
              key={i}
              x={line.x}
              y={line.y + line.ascender}
              fill={`url(#${id})`}
              fontFamily={family}
              fontSize={fontSize}
              letterSpacing={flat.letterSpacing}
            >
              {line.text.replace(/\n$/, '')}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignSelf: 'stretch' },
  hidden: { color: 'transparent', opacity: 0 },
});
