import { getStatusColor, getStatusLabel, getTypeLabel } from '@/app/list-emergrn/store';
import { COLORS } from '@/constants/colors';
import { EmergencyType, Report, ReportStatus } from '@/types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, {
  Circle,
  G,
  Image as SvgImage,
  Text as SvgText
} from 'react-native-svg';
interface MapViewProps {
  reports: Report[];
  expandedId: string | null;
  onMarkerPress: (id: string | null) => void;
  onResolve: (id: string) => void;
}
const ALERT_PINS = [
  { bid: 8,  cx: 224, cy: 149, color: '#FF3B30' }, 
  { bid: 20, cx: 142, cy: 110, color: '#FF9500' }, 
  { bid: 28, cx: 63,  cy: 112, color: '#007AFF' }, 
];
export function EmergencyMapView({ reports, expandedId, onMarkerPress, onResolve }: MapViewProps) {
  const selectedReport = reports.find((r) => r.id === expandedId) ?? null;
  const BUILDINGS = [
    { bid: 13, name: 'مسرح المصري', cx: 200, cy: 60 },
    { bid: 20, name: 'مكتبة', cx: 160, cy: 95 },
    { bid: 17, name: 'مدرج الأمير تركي', cx: 160, cy: 115 },
    { bid: 19, name: 'الفنون', cx: 140, cy: 110 },
    { bid: 25, name: 'الكوري', cx: 105, cy: 100 },
    { bid: 28, name: 'المراكز العلمية', cx: 88, cy: 85 },
    { bid: 26, name: 'القانون', cx: 90, cy: 100 },
    { bid: 22, name: 'طب', cx: 155, cy: 55},
    { bid: 24, name: 'الصيدلة', cx: 125, cy: 55 },
    { bid: 8,  name: 'هندسة و it', cx: 245, cy: 117 },
    { bid: 9,  name: 'العلوم', cx: 225, cy: 90 },
    { bid: 7,  name: 'الجامع', cx: 270, cy: 70 },
    { bid: 2,  name: 'الأمن', cx: 290, cy: 65 },
    { bid: 4,  name: 'الرياضة', cx: 290, cy: 100 },
    { bid: 1,  name: 'الملعب', cx: 3303, cy: 95 },
    { bid: 14, name: 'الساحة البيضا', cx: 200, cy: 95 },
  ];
  return (
    <View style={styles.wrapper}>
      {}
      <ScrollView style={styles.mapScroll} contentContainerStyle={styles.mapScrollContent}>
        <Svg width="100%" viewBox="0 0 400 190" style={styles.svg}>
          {}
          <SvgImage
            href={require('../../../assets/images/map.png')}
            x="0"
            y="0"
            width="400"
            height="190"
            preserveAspectRatio="xMidYMid slice"
            onPress={(e: any) => {
              const { locationX, locationY } = e.nativeEvent;
              console.log(`[MAP CLICK] Tap coordinates -> cx: ${Math.round(locationX)}, cy: ${Math.round(locationY)}`);
              alert(`الإحداثيات لهذا المكان هي:\ncx: ${Math.round(locationX)}\ncy: ${Math.round(locationY)}\n\nقم بتسجيلها وتعديلها في الملف!`);
            }}
          />
          {}
          {BUILDINGS.map((pin) => {
            const cx = pin.cx;
            const cy = pin.cy;
            const matchedReport = reports.find((r) => {
              if (pin.bid === 8 && r.type === 'Fire') return true;
              if (pin.bid === 20 && r.type === 'Fainting') return true;
              if (pin.bid === 28 && r.type === 'Security') return true;
              if (r.location && r.location.includes(pin.name)) return true;
              return false;
            });
            if (!matchedReport) {
              return null;
            }
            const color = getStatusColor(matchedReport.status);
            return (
              <G key={pin.bid} onPress={() => onMarkerPress(matchedReport.id)}>
                {}
                <Circle cx={cx} cy={cy} r="7" fill={color} opacity="0.25" pointerEvents="none"/>
                {}
                <Circle cx={cx} cy={cy} r="5" fill={color} pointerEvents="none"/>
                <SvgText x={cx} y={cy + 2} textAnchor="middle"
                  fontSize="6"
                  fontWeight="700" fontFamily="System" fill="#fff" pointerEvents="none">!</SvgText>
                {}
                <Circle cx={cx} cy={cy} r="15" fill="transparent"/>
              </G>
            );
          })}
          {}
          {selectedReport && (() => {
            const pin = BUILDINGS.find(p => {
              if (p.bid === 8 && selectedReport.type === 'Fire') return true;
              if (p.bid === 20 && selectedReport.type === 'Fainting') return true;
              if (p.bid === 28 && selectedReport.type === 'Security') return true;
              if (selectedReport.location && selectedReport.location.includes(p.name)) return true;
              return false;
            });
            if (!pin) return null;
            const cx = pin.cx;
            const cy = pin.cy;
            return (
              <Circle cx={cx} cy={cy} r={12} fill="none" stroke="#FF3B30" strokeWidth="2" pointerEvents="none"/>
            );
          })()}
        </Svg>
      </ScrollView>
      {}
      <View style={styles.legend}>
        {[
          { color: '#1E3157', label: 'كليات' },
          { color: '#E07B1A', label: 'مرافق' },
          { color: '#1B8899', label: 'رياضة' },
          { color: '#FF3B30', label: 'بلاغ نشط', circle: true },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[
              styles.legendDot,
              item.circle && styles.legendCircle,
              { backgroundColor: item.color },
            ]}/>
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      {}
      {selectedReport && (
        <MapBottomSheet
          report={selectedReport}
          onClose={() => onMarkerPress(null)}
          onResolve={() => onResolve(selectedReport.id)}
        />
      )}
    </View>
  );
}
function MapBottomSheet({ report, onClose, onResolve }: { report: Report; onClose: () => void; onResolve: () => void }) {
  const statusColor = getStatusColor(report.status);
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHandle}/>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetType}>
          {getTypeLabel(report.type as EmergencyType)}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.sheetClose}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sheetLocation}>📍 {report.location}</Text>
      <Text style={styles.sheetDesc} numberOfLines={3}>{report.description}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]}/>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusLabel(report.status as ReportStatus)}
        </Text>
      </View>
      {report.status !== 'Resolved' && (
        <TouchableOpacity style={styles.sheetResolveBtn} onPress={onResolve}>
          <Text style={styles.sheetResolveBtnText}>✔️ تعيين كـ تم الحل</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapScroll: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
  },
  svg: {
    width: '100%',
    aspectRatio: 400 / 190, 
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendCircle: {
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sheetClose: {
    fontSize: 18,
    color: COLORS.textSecondary,
    padding: 4,
  },
  sheetLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: 6,
  },
  sheetDesc: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetResolveBtn: {
    marginTop: 16,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sheetResolveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});