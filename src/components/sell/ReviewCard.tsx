import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImageName } from '../../../assets/images';
import { Text } from '../common/Text';
import { KeyValueRows, Photo } from '../common/ui';
import { shadows } from '../../theme';

type Props = {
  img: ImageName;
  name: string;
  sub: string;
  rows: { k: string; v: string }[];
  children?: React.ReactNode;
  marginTop?: number;
};

/** Review summary: product line with "Edit", key/value rows and an optional footer. */
export function ReviewCard({
  img,
  name,
  sub,
  rows,
  children,
  marginTop = 14,
}: Props) {
  return (
    <View style={[styles.card, { marginTop }]}>
      <View style={styles.product}>
        <Photo name={img} style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        <Text style={styles.edit}>Edit</Text>
      </View>
      <KeyValueRows rows={rows} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: shadows.cardRaised,
  },
  product: {
    padding: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  thumb: { width: 56, height: 56, borderRadius: 11 },
  flex: { flex: 1 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  sub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  edit: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
});
