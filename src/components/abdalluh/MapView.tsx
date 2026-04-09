/**
 * components/MapView.tsx
 * -----------------------
 * Live emergency map showing Najah University campus.
 * Uses react-native-svg to render the actual campus layout.
 *
 * Install dependency first:
 *   npx expo install react-native-svg
 *
 * Buildings match the official Najah campus map numbers.
 */

import { getStatusColor, getStatusLabel, getTypeLabel } from '@/app/abdalluh/store';
import { COLORS } from '@/constants/colors';
import { EmergencyType, Report, ReportStatus } from '@/types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Pattern,
  Polygon,
  Rect,
  Text as SvgText
} from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  reports: Report[];
  expandedId: string | null;
  onMarkerPress: (id: string | null) => void;
}

// ─── Building definitions matching the real campus map ───────────────────────
// Each entry has:
//   id    → building number shown on the official map
//   label → Arabic name
//   color → fill color matching the campus map palette
//   shape → 'rect' | 'circle'
//   ...   → position/size coords in the 680×284 SVG coordinate space

type Building =
  | { id: number; label: string; color: string; shape: 'rect'; x: number; y: number; w: number; h: number }
  | { id: number; label: string; color: string; shape: 'circle'; cx: number; cy: number; r: number };

const BUILDINGS: Building[] = [
  { id: 24, label: 'كلية الصيدلة',                  color: '#1E3157', shape: 'rect',   x: 88,  y: 37,  w: 27, h: 25 },
  { id: 22, label: 'كلية الطب',                     color: '#1E3157', shape: 'rect',   x: 115, y: 50,  w: 30, h: 27 },
  { id: 13, label: 'المسرح المصري',                  color: '#E07B1A', shape: 'circle', cx: 186, cy: 83, r: 33 },
  { id: 14, label: 'الساحة البيضاء',                 color: '#E07B1A', shape: 'rect',   x: 162, y: 104, w: 54, h: 57 },
  { id: 20, label: 'المكتبة',                        color: '#1E3157', shape: 'rect',   x: 124, y: 90,  w: 35, h: 40 },
  { id: 19, label: 'كلية الفنون',                    color: '#1E3157', shape: 'rect',   x: 112, y: 133, w: 24, h: 44 },
  { id: 17, label: 'مدرج الأمير تركي',               color: '#1E3157', shape: 'rect',   x: 142, y: 148, w: 40, h: 27 },
  { id: 25, label: 'المركز الكوري',                  color: '#1E3157', shape: 'rect',   x: 79,  y: 120, w: 24, h: 42 },
  { id: 28, label: 'مراكز العلوم',                   color: '#1E3157', shape: 'rect',   x: 38,  y: 87,  w: 50, h: 50 },
  { id: 27, label: 'مبنى 27',                        color: '#1E3157', shape: 'rect',   x: 14,  y: 115, w: 22, h: 36 },
  { id: 26, label: 'كلية الحقوق',                    color: '#1E3157', shape: 'rect',   x: 40,  y: 140, w: 28, h: 22 },
  { id: 9,  label: 'كلية العلوم',                    color: '#1E3157', shape: 'rect',   x: 207, y: 87,  w: 34, h: 44 },
  { id: 8,  label: 'الهندسة وتقنية المعلومات',        color: '#1E3157', shape: 'rect',   x: 207, y: 134, w: 34, h: 52 },
  { id: 7,  label: 'مبنى الجامعة',                   color: '#E07B1A', shape: 'rect',   x: 254, y: 92,  w: 30, h: 26 },
  { id: 2,  label: 'مبنى الأمن',                     color: '#E07B1A', shape: 'rect',   x: 272, y: 49,  w: 22, h: 20 },
  { id: 4,  label: 'المركز الرياضي',                 color: '#1B8899', shape: 'rect',   x: 263, y: 120, w: 28, h: 33 },
  { id: 1,  label: 'الملعب',                         color: '#1B8899', shape: 'rect',   x: 294, y: 87,  w: 70, h: 88 },
];

// Alert pulse markers: each alert is pinned to a building center
const ALERT_PINS = [
  { bid: 8,  cx: 224, cy: 149, color: '#FF3B30' }, // Fire @ Engineering
  { bid: 20, cx: 142, cy: 110, color: '#FF9500' }, // Fainting @ Library
  { bid: 28, cx: 63,  cy: 112, color: '#007AFF' }, // Security @ Science Centers
];

// Parking marker positions
const PARKING = [
  { x: 348, y: 38 }, { x: 267, y: 63 }, { x: 140, y: 192 },
  { x: 218, y: 218 }, { x: 252, y: 218 }, { x: 291, y: 218 },
];


// ─── Helper: get center of a building for selection ring placement ────────────
function getBuildingCenter(b: Building): { cx: number; cy: number; rw: number; rh: number } {
  if (b.shape === 'circle') return { cx: b.cx, cy: b.cy, rw: b.r + 6, rh: b.r + 6 };
  return { cx: b.x + b.w / 2, cy: b.y + b.h / 2, rw: b.w / 2 + 4, rh: b.h / 2 + 4 };
}


// ─── Main exported component ──────────────────────────────────────────────────
export function EmergencyMapView({ reports, expandedId, onMarkerPress }: MapViewProps) {
  const selectedReport = reports.find((r) => r.id === expandedId) ?? null;

  // Find which building ID has an alert for a given report
  // We match by checking if any ALERT_PIN bid matches a building, and report
  // location contains the building label (basic heuristic — replace with
  // a proper buildingId field on Report when you have it)
  const getAlertForBuilding = (bid: number) =>
    reports.find((r) => {
      const pin = ALERT_PINS.find((p) => p.bid === bid);
      return pin !== undefined;
    });

  return (
    <View style={styles.wrapper}>

      {/* ── Campus SVG Map ──────────────────────────────────────── */}
      <ScrollView style={styles.mapScroll} contentContainerStyle={styles.mapScrollContent}>
        <Svg width="100%" viewBox="0 0 400 190" style={styles.svg}>
          <Defs>
            {/* Crosshatch pattern for building 28 (Science Centers) */}
            <Pattern id="hp" patternUnits="userSpaceOnUse" width="8" height="8">
              <Line x1="0" y1="8" x2="8" y2="0" stroke="#1E3157" strokeWidth="1.3"/>
              <Line x1="0" y1="0" x2="8" y2="8" stroke="#1E3157" strokeWidth="1.3"/>
            </Pattern>
          </Defs>

          {/* ── Base / roads ──────────────────────────────────── */}
          <Rect width="400" height="190" fill="#D4CFC0"/>
          <Rect x="56" y="0" width="344" height="18" fill="#E0DACE"/>
          <Polygon points="0,0 42,16 42,190 0,190" fill="#E0DACE"/>
          <Rect x="42" y="167" width="358" height="23" fill="#E0DACE"/>
          {/* Internal road dividers */}
          <Rect x="222" y="18" width="16" height="149" fill="#E0DACE"/>
          <Rect x="260" y="18" width="14" height="149" fill="#E0DACE"/>
          <Rect x="354" y="18" width="46" height="149" fill="#E0DACE" opacity="0.7"/>
          {/* Campus ground */}
          <Rect x="42" y="18" width="180" height="149" fill="#C8C3B3"/>

          {/* Green garden area (top-left) */}
          <Rect x="27" y="27" width="28" height="33" rx="3" fill="#ACBA94"/>

          {/* Right teal block (appears on real map, unlabeled) */}
          <Rect x="219" y="57" width="38" height="62" fill="#1B8899" rx="2" opacity="0.85"/>

          {/* Road labels */}
          <SvgText x="210" y="14" textAnchor="middle" fontSize="5.5" fill="#9A9280" fontFamily="System">شارع الأكاديمية</SvgText>
          <SvgText x="130" y="180" textAnchor="middle" fontSize="5" fill="#9A9280" fontFamily="System">شارع الأكاديمية - البوابة الرئيسية</SvgText>

          {/* ── Buildings ─────────────────────────────────────── */}
          {BUILDINGS.map((b) => {
            const isSelected = selectedReport
              ? ALERT_PINS.some(p => p.bid === b.id) && reports.some(r => r.id === expandedId)
              : false;
            // Scale coords from 680 space → 400 space
            const scale = 400 / 680;

            if (b.shape === 'rect') {
              const sx = b.x * scale, sy = b.y * scale;
              const sw = b.w * scale, sh = b.h * scale;
              // Special crosshatch for building 28
              const fill = b.id === 28 ? 'url(#hp)' : b.color;
              const stroke = b.id === 28 ? '#1E3157' : 'none';
              return (
                <G key={b.id} onPress={() => {
                  const alert = reports.find(r =>
                    ALERT_PINS.find(p => p.bid === b.id)
                  );
                  if (alert) onMarkerPress(alert.id);
                }}>
                  <Rect x={sx} y={sy} width={sw} height={sh}
                    fill={fill} stroke={stroke} strokeWidth={b.id===28?1:0} rx="1.5"/>
                  {/* Number badge */}
                  <Circle cx={sx + 7} cy={sy} r="5.5" fill="#fff" stroke={b.color} strokeWidth="0.8"/>
                  <SvgText x={sx + 7} y={sy + 2} textAnchor="middle"
                    fontSize="4.5" fontWeight="700"
                    fontFamily="System" fill={b.color}>{b.id}</SvgText>
                </G>
              );
            } else {
              // circle
              const scx = b.cx * scale, scy = b.cy * scale, sr = b.r * scale;
              return (
                <G key={b.id} onPress={() => {
                  const alert = reports.find(r =>
                    ALERT_PINS.find(p => p.bid === b.id)
                  );
                  if (alert) onMarkerPress(alert.id);
                }}>
                  <Circle cx={scx} cy={scy} r={sr} fill={b.color}/>
                  <Circle cx={scx - sr * 0.65} cy={scy - 2} r="5.5"
                    fill="#fff" stroke={b.color} strokeWidth="0.8"/>
                  <SvgText x={scx - sr * 0.65} y={scy + 1.5}
                    textAnchor="middle"
                    fontSize="4.5" fontWeight="700" fontFamily="System" fill={b.color}>{b.id}</SvgText>
                </G>
              );
            }
          })}

          {/* ── Parking markers ──────────────────────────────── */}
          {PARKING.map((p, i) => {
            const scale = 400 / 680;
            return (
              <G key={i} pointerEvents="none">
                <Circle cx={p.x * scale} cy={p.y * scale} r="4.5" fill="#4A82C9"/>
                <SvgText x={p.x * scale} y={p.y * scale + 1.5}
                  textAnchor="middle"
                  fontSize="4" fontWeight="700" fontFamily="System" fill="#fff">P</SvgText>
              </G>
            );
          })}

          {/* ── Alert pulse rings ─────────────────────────────── */}
          {ALERT_PINS.map((pin) => {
            const scale = 400 / 680;
            const cx = pin.cx * scale, cy = pin.cy * scale;
            // Match this pin to a report
            const matchedReport = reports.find((r) =>
              // Simple heuristic: first alert pinned to this building
              // Replace with report.buildingId === pin.bid when available
              pin.bid === 8  ? r.type === 'Fire'     :
              pin.bid === 20 ? r.type === 'Fainting' :
              r.type === 'Security'
            );
            if (!matchedReport) return null;
            return (
              <G key={pin.bid} pointerEvents="none">
                {/* Outer pulse ring */}
                <Circle cx={cx} cy={cy} r="7" fill={pin.color} opacity="0.25"/>
                {/* Inner solid dot */}
                <Circle cx={cx} cy={cy} r="5" fill={pin.color}/>
                <SvgText x={cx} y={cy + 2} textAnchor="middle"
                  fontSize="6"
                  fontWeight="700" fontFamily="System" fill="#fff">!</SvgText>
              </G>
            );
          })}

          {/* ── Selection highlight ring ──────────────────────── */}
          {selectedReport && (() => {
            const pin = ALERT_PINS.find(p =>
              p.bid === 8  ? selectedReport.type === 'Fire'     :
              p.bid === 20 ? selectedReport.type === 'Fainting' :
              selectedReport.type === 'Security'
            );
            if (!pin) return null;
            const b = BUILDINGS.find(b => b.id === pin.bid);
            if (!b) return null;
            const scale = 400 / 680;
            if (b.shape === 'circle') {
              return (
                <Circle cx={b.cx * scale} cy={b.cy * scale} r={b.r * scale + 4}
                  fill="none" stroke="#FF3B30" strokeWidth="2" pointerEvents="none"/>
              );
            }
            return (
              <Rect x={b.x * scale - 3} y={b.y * scale - 3}
                width={b.w * scale + 6} height={b.h * scale + 6}
                fill="none" stroke="#FF3B30" strokeWidth="2" rx="3" pointerEvents="none"/>
            );
          })()}
        </Svg>
      </ScrollView>

      {/* ── Legend ───────────────────────────────────────────────── */}
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

      {/* ── Bottom sheet ─────────────────────────────────────────── */}
      {selectedReport && (
        <MapBottomSheet
          report={selectedReport}
          onClose={() => onMarkerPress(null)}
        />
      )}
    </View>
  );
}


// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
function MapBottomSheet({ report, onClose }: { report: Report; onClose: () => void }) {
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
    </View>
  );
}


// ─── Styles ───────────────────────────────────────────────────────────────────
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

  // Map scroll area (allows zooming on small screens via horizontal scroll)
  mapScroll: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
  },
  svg: {
    width: '100%',
    aspectRatio: 400 / 190, // keep proportional to viewBox
  },

  // Legend row below the map
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

  // Bottom sheet
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
});