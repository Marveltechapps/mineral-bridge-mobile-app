import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp, ease } from '../common/animations';
import { Icon } from '../common/Icon';
import { Text } from '../common/Text';
import { gradients } from '../../theme';

type Props = {
  mine: boolean;
  text: string;
  time: string;
  /** Sender caption (ticket thread). */
  who?: string;
  read?: boolean;
  delay: number;
  duration?: number;
  maxWidth: `${number}%`;
  easing?: (v: number) => number;
};

/** Conversation bubble: navy for the user (right), white for the desk (left). */
export function ChatBubble({
  mine,
  text,
  time,
  who,
  read,
  delay,
  duration = 400,
  maxWidth,
  easing = ease.brand,
}: Props) {
  return (
    <FadeUp
      duration={duration}
      delay={delay}
      easing={easing}
      style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}
    >
      <View
        style={[
          styles.bubble,
          who ? styles.thread : styles.chat,
          mine ? styles.mine : styles.theirs,
          { maxWidth },
        ]}
      >
        {who ? (
          <Text style={[styles.who, { color: mine ? '#8f9dcd' : '#606780' }]}>
            {who}
          </Text>
        ) : null}
        <Text
          style={[
            styles.text,
            { color: mine ? '#e7ebf6' : '#4a5170' },
            who ? styles.threadText : null,
          ]}
          leading={1.55}
        >
          {text}
        </Text>
        {who ? (
          <Text
            style={[
              styles.time,
              styles.threadTime,
              { color: mine ? '#8f9dcd' : '#606780' },
            ]}
          >
            {time}
          </Text>
        ) : (
          <View style={styles.meta}>
            <Text
              style={[styles.time, { color: mine ? '#8f9dcd' : '#606780' }]}
            >
              {time}
            </Text>
            {read ? (
              <Icon
                name="doubleCheck"
                size={13}
                color="#86efac"
                strokeWidth={3}
              />
            ) : null}
          </View>
        )}
      </View>
    </FadeUp>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  bubble: { borderWidth: 1, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' },
  chat: { paddingVertical: 11, paddingHorizontal: 14 },
  thread: { paddingVertical: 12, paddingHorizontal: 14 },
  mine: {
    experimental_backgroundImage: gradients.navyButton,
    borderColor: '#16204a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 12,
  },
  theirs: {
    backgroundColor: '#fff',
    borderColor: '#e5e7ec',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 4,
  },
  who: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  text: { fontSize: 13 },
  threadText: { marginTop: 5 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 6,
  },
  time: { fontSize: 10.5 },
  threadTime: { marginTop: 7 },
});
