import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { images } from '../../../assets/images';
import { Pop, ease } from '../common/animations';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { Scrim } from '../common/ui';
import { VID, VID_LEN } from '../../lib/catalog';
import { gradients } from '../../theme';

const CHAPTER_LABELS = ['Intro', 'Basics', 'Who', 'Bridge', 'Trade'];
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const clock = (s: number) =>
  String(Math.floor(s / 60)) +
  ':' +
  String(Math.floor(s % 60)).padStart(2, '0');

/**
 * The inline explainer "video": five Ken Burns shots over the design's
 * photography with captions, a chapter rail and transport controls. Time
 * advances per animation frame while playing and the screen is in front.
 */
export function ExplainerVideo() {
  const [vt, setVt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [width, setWidth] = useState(0);
  const focused = useIsFocused();
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!playing || !focused) return;
    let last = Date.now();
    const step = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      setVt(t => (t + dt) % VID_LEN);
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [playing, focused]);

  const seek = useCallback((t: number) => {
    setVt(t);
    setPlaying(true);
  }, []);

  const shot = VID.find(s => vt >= s.at && vt < s.at + s.dur) ?? VID[0];
  const tIn = vt - shot.at;
  const textOpacity = Math.min(
    1,
    Math.max(0, tIn / 0.55),
    Math.max(0, (shot.dur - tIn) / 0.5),
  );
  const rise = clamp01(tIn / 0.7);
  const textY = 14 * (1 - rise * rise);
  const showRail = vt >= 19.5 && vt < 27.5;
  const railP = clamp01((vt - 20.4) / 5.2);

  return (
    <View>
      <View style={styles.player}>
        <View
          style={styles.stage}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
          {VID.map(s => {
            const t = vt - s.at;
            const fade = 0.7;
            const o =
              t > -fade && t < s.dur + fade
                ? Math.min(
                    1,
                    Math.max(0, (t + fade) / fade),
                    Math.max(0, (s.dur + fade - t) / fade),
                  )
                : 0;
            const p = clamp01(t / s.dur);
            const z = s.z[0] + (s.z[1] - s.z[0]) * p;
            const px = s.pan[0] + (s.pan[1] - s.pan[0]) * p;
            return (
              <Image
                key={s.img + s.at}
                source={images[s.img]}
                resizeMode="cover"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    opacity: o,
                    transform: [
                      { scale: z },
                      { translateX: (px / 100) * width },
                    ],
                  },
                ]}
              />
            );
          })}
          <Scrim gradient="linear-gradient(180deg,rgba(14,20,48,0.34) 0%,rgba(14,20,48,0.22) 42%,rgba(14,20,48,0.92) 100%)" />

          {showRail ? (
            <View style={styles.rail} pointerEvents="none">
              <View style={styles.railLabels}>
                <Text style={styles.railLabel}>SELLER</Text>
                <Text style={[styles.railLabel, styles.railGold]}>
                  VERIFIER
                </Text>
                <Text style={styles.railLabel}>BUYER</Text>
              </View>
              <View style={styles.railTrack}>
                <View style={[styles.railFill, { width: `${railP * 100}%` }]} />
                <View
                  style={[
                    styles.railDot,
                    { left: `${railP * 100}%`, marginLeft: -6 },
                  ]}
                />
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.caption,
              { opacity: textOpacity, transform: [{ translateY: textY }] },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.kicker}>{shot.kicker}</Text>
            <Text style={styles.vTitle} leading={1.18}>
              {shot.title}
            </Text>
            <Text style={styles.vSub} leading={1.45}>
              {shot.sub}
            </Text>
          </View>

          {playing ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setPlaying(false)}
              accessibilityLabel="Pause video"
            />
          ) : (
            <Pressable
              style={[StyleSheet.absoluteFill, styles.paused]}
              onPress={() => setPlaying(true)}
              accessibilityLabel="Play video"
            >
              <Pop duration={300} easing={ease.out} style={styles.bigPlay}>
                <Icon name="play" filled size={22} color="#1e2a5a" />
              </Pop>
            </Pressable>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setPlaying(p => !p)}
            style={styles.control}
            accessibilityLabel={playing ? 'Pause' : 'Play'}
          >
            <Icon
              name={playing ? 'pause' : 'play'}
              filled
              size={12}
              color="#fff"
            />
          </Pressable>
          <Pressable
            onPress={() => seek(0)}
            style={styles.control}
            accessibilityLabel="Restart"
          >
            <Icon name="restart" size={12} color="#fff" strokeWidth={2.4} />
          </Pressable>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(vt / VID_LEN) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.clock}>{clock(vt) + ' · ' + clock(VID_LEN)}</Text>
        </View>
      </View>

      <View style={styles.chapters}>
        {VID.map((s, i) => {
          const active = vt >= s.at && vt < s.at + s.dur;
          return (
            <PressableScale
              key={s.at}
              activeScale={0.94}
              onPress={() => seek(s.at + 0.05)}
              accessibilityState={{ selected: active }}
              style={[
                styles.chapter,
                active
                  ? {
                      experimental_backgroundImage: gradients.navyAvatar,
                      borderColor: '#16204a',
                      boxShadow: '0 2px 10px rgba(30,42,90,0.28)',
                    }
                  : {
                      backgroundColor: '#fff',
                      borderColor: '#e2e5ec',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                    },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chapterLabel,
                  { color: active ? '#fff' : '#606780' },
                ]}
              >
                {CHAPTER_LABELS[i]}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const textShadow = {
  textShadowColor: 'rgba(14,20,48,0.6)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 10,
};

const styles = StyleSheet.create({
  player: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0e1430',
    boxShadow: '0 2px 8px rgba(16,24,40,0.14), 0 12px 26px rgba(16,24,40,0.16)',
  },
  stage: { aspectRatio: 16 / 9, overflow: 'hidden' },
  rail: { position: 'absolute', left: '14%', right: '14%', top: '20%' },
  railLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  railLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.82)',
    textShadowColor: 'rgba(14,20,48,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  railGold: { color: '#f3d27a' },
  railTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
  railFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 2,
    backgroundColor: '#f3d27a',
  },
  railDot: {
    position: 'absolute',
    top: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3d27a',
    boxShadow: '0 0 12px rgba(243,210,122,0.9)',
  },
  caption: { position: 'absolute', left: 16, right: 16, bottom: 34 },
  kicker: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 1.1,
    color: '#a9b5dd',
  },
  vTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    marginTop: 5,
    letterSpacing: -0.4,
    ...textShadow,
  },
  vSub: {
    fontSize: 11,
    color: '#d3daf0',
    marginTop: 5,
    textShadowColor: 'rgba(14,20,48,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  paused: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,20,48,0.30)',
  },
  bigPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(16,24,40,0.3)',
  },
  controls: {
    backgroundColor: '#10163a',
    paddingTop: 9,
    paddingHorizontal: 12,
    paddingBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  control: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    experimental_backgroundImage: gradients.goldBar,
  },
  clock: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: '#c3cbe8',
  },
  chapters: { flexDirection: 'row', gap: 7, marginTop: 10 },
  chapter: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chapterLabel: { fontSize: 9.5, fontWeight: '600', textAlign: 'center' },
});
