import React from 'react';
import { PixelRatio, Platform, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Text } from '../src/components/common/Text';

async function styleOf(el: React.ReactElement<{ testID?: string }>) {
  await render(React.cloneElement(el, { testID: 't' }));
  return StyleSheet.flatten(screen.getByTestId('t').props.style);
}

describe('Text', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('maps weights to Poppins faces and uses CSS normal line height', async () => {
    Platform.OS = 'ios';
    const s = await styleOf(
      <Text style={{ fontSize: 14, fontWeight: '600' }}>Hello</Text>,
    );
    expect(s.fontFamily).toBe('Poppins-SemiBold');
    expect(s.fontWeight).toBeUndefined();
    expect(s.lineHeight).toBe(21);
    expect(s.includeFontPadding).toBe(false);
  });

  it('applies CSS unitless leading', async () => {
    Platform.OS = 'ios';
    expect(
      (
        await styleOf(
          <Text style={{ fontSize: 12.5 }} leading={1.45}>
            x
          </Text>,
        )
      ).lineHeight,
    ).toBeCloseTo(18.125);
  });

  it('uses the bold italic face for italic text', async () => {
    Platform.OS = 'ios';
    expect(
      (
        await styleOf(
          <Text style={{ fontStyle: 'italic', fontWeight: '700' }}>x</Text>,
        )
      ).fontFamily,
    ).toBe('Poppins-BoldItalic');
  });

  it("corrects Android's whole-pixel font sizes towards the design", async () => {
    Platform.OS = 'android';
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2.5);
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1);
    // 12.5dp × 2.5 = 31.25px: aim for 31px (Android would otherwise ceil to 32px)…
    const s = await styleOf(
      <Text style={{ fontSize: 12.5 }}>
        Mineral Bridge owns the stock it sells.
      </Text>,
    );
    expect(Math.ceil((s.fontSize as number) * 2.5)).toBe(31);
    // …and spread the missing 0.25px per em over the glyphs.
    expect(s.letterSpacing).toBeGreaterThan(0);
    expect(s.letterSpacing).toBeLessThan(0.05);
  });

  it('leaves exact pixel sizes untouched on Android', async () => {
    Platform.OS = 'android';
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2.5);
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1);
    const s = await styleOf(
      <Text style={{ fontSize: 14, letterSpacing: -0.2 }}>Exact</Text>,
    );
    expect(Math.ceil((s.fontSize as number) * 2.5)).toBe(35);
    expect(s.letterSpacing).toBeCloseTo(-0.2, 3);
  });
});
