import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FadeUp } from '../../components/common/animations';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { IconTile, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { go, flash } from '../../navigation/flow';
import { setAppState } from '../../context/appStore';

const NOTIFS = [
  {
    title: 'You have been outbid on Cobalt Hydroxide',
    body: 'New highest bid $49,600 · 2h 14m left',
    time: '4 minutes ago',
    unread: true,
    icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
    iconBg: '#fbf3e4',
    iconFg: '#a1620b',
    delay: 50,
  },
  {
    title: 'Order MB-2026-04871 is in transit',
    body: 'Arriving Wed 10 Sep, 14:00–17:00',
    time: '2 hours ago',
    unread: true,
    icon: 'M3 7h11v10H3zM14 10h4l3 3v4h-7z',
    iconBg: '#eef3fe',
    iconFg: '#1d4fd7',
    delay: 110,
  },
  {
    title: 'Verified quote ready',
    body: 'Final assay 249.6 kg at 22K — review and approve.',
    time: '1 day ago',
    unread: true,
    icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
    iconBg: '#ecf7f0',
    iconFg: '#15803d',
    delay: 170,
  },
  {
    title: 'Export permit expires in 21 days',
    body: 'Renew NG-EXP-2026-11204 to keep selling in bulk.',
    time: '2 days ago',
    unread: false,
    icon: 'M12 9v4M12 17h.01M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8A1.8 1.8 0 0 0 21.5 18L13.7 3.9a1.8 1.8 0 0 0-3.4 0z',
    iconBg: '#fbf3e4',
    iconFg: '#a1620b',
    delay: 230,
  },
  {
    title: 'New lesson: Pit wall collapse warning signs',
    body: 'Safe Mining · for artisanal miners · 5:40',
    time: '4 days ago',
    unread: false,
    icon: 'M10 8.5v7l6-3.5zM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    iconBg: '#f1f3f7',
    iconFg: '#33406e',
    delay: 290,
  },
];

/** P3 · Notifications — unread markers and per-type icons. */
export function NotificationsScreen() {
  return (
    <ScreenContainer screen="notifs" contentStyle={styles.content}>
      <View style={styles.head}>
        <SectionLabel>3 UNREAD</SectionLabel>
        <Pressable
          onPress={() => flash('All notifications marked read')}
          accessibilityRole="button"
        >
          <Text style={styles.markRead}>Mark all read</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {NOTIFS.map(n => (
          <FadeUp key={n.title} duration={500} delay={n.delay}>
            <PressableScale
              activeScale={0.985}
              onPress={() => {
                if (n.title.startsWith('You have been outbid')) {
                  setAppState({ banner: true });
                  go('aDetail');
                  return;
                }
                flash('Opening notification');
              }}
              style={[
                styles.card,
                {
                  backgroundColor: n.unread ? '#fff' : '#fafbfc',
                  borderColor: n.unread ? '#e2e5ec' : '#eceef2',
                },
              ]}
            >
              <IconTile
                size={34}
                radius={10}
                bgColor={n.iconBg}
                color={n.iconFg}
                d={n.icon}
                iconSize={17}
              />
              <View style={styles.flex}>
                <Text style={styles.title} leading={1.4}>
                  {n.title}
                </Text>
                <Text style={styles.body} leading={1.45}>
                  {n.body}
                </Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
              {n.unread ? (
                <View style={styles.dot} accessibilityLabel="Unread" />
              ) : null}
            </PressableScale>
          </FadeUp>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginHorizontal: 2,
    marginBottom: 12,
  },
  markRead: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  list: { gap: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  title: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  body: { fontSize: 12, color: '#606780', marginTop: 3 },
  time: { fontSize: 11, color: '#a3abc4', marginTop: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 4,
  },
});
