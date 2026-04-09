import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';

type TimelineItem = {
  status: string;
  time: string;
  note: string;
};

type TimelineSectionProps = {
  timeline: TimelineItem[];
};

export function TimelineSection({ timeline }: TimelineSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>تسلسل الحالة</Text>

      {timeline.map((item, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStatus}>{item.status}</Text>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <Text style={styles.timelineNote}>{item.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}