import {
  getStatusColor,
  getStatusLabel,
  getTypeLabel,
} from "@/app/list-emergrn/store";
import { COLORS } from "@/constants/colors";
import { EmergencyType, Report, ReportStatus } from "@/types";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from "react-native";
import Svg, {
  Circle,
  G,
  Image as SvgImage,
  Text as SvgText,
} from "react-native-svg";

interface MapViewProps {
  reports: Report[];
  expandedId: string | null;
  onMarkerPress: (id: string | null) => void;
}

const BUILDINGS = [
  { bid: 13, name: "مسرح المصري", cx: 200, cy: 60 },
  { bid: 20, name: "المكتبة", cx: 160, cy: 95 },
  { bid: 17, name: "مدرج الأمير تركي", cx: 160, cy: 115 },
  { bid: 19, name: "كلية الفنون", cx: 140, cy: 110 },
  { bid: 25, name: "مركز اللغات (الكوري)", cx: 105, cy: 100 },
  { bid: 28, name: "المراكز العلمية", cx: 88, cy: 85 },
  { bid: 26, name: "كلية القانون", cx: 90, cy: 100 },
  { bid: 22, name: "كلية الطب", cx: 155, cy: 55 },
  { bid: 24, name: "كلية الصيدلة", cx: 125, cy: 55 },
  { bid: 8, name: "كلية الهندسه وتكنولوجيا المعلومات", cx: 245, cy: 117 },
  { bid: 9, name: "كلية العلوم", cx: 225, cy: 90 },
  { bid: 7, name: "المسجد", cx: 270, cy: 70 },
  { bid: 2, name: "الأمن", cx: 290, cy: 65 },
  { bid: 4, name: "الصالة الرياضية", cx: 290, cy: 100 },
  { bid: 1, name: "الملعب", cx: 330, cy: 95 },
  { bid: 14, name: "الساحة البيضاء", cx: 200, cy: 95 },
];
const LEGEND_ITEMS = [
  { color: "#1E3157", label: "كليات" },
  { color: "#E07B1A", label: "مرافق" },
  { color: "#1B8899", label: "رياضة" },
  { color: "#FF3B30", label: "بلاغ نشط", circle: true },
];

const SVG_W = 400;
const SVG_H = 190;

const normalizeArabic = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/[ىي]/g, "ي")
    .split(" ")
    .map((w) => (w.startsWith("ال") ? w.substring(2) : w))
    .join(" ")
    .trim();
};

const checkPinMatch = (pin: (typeof BUILDINGS)[0], report: Report) => {
  if (!report.location) return false;

  const reportLoc = normalizeArabic(report.location);
  const pinName = normalizeArabic(pin.name);

  if (reportLoc.includes(pinName) || pinName.includes(reportLoc)) return true;

  // Ignore common words used in combinations that could cause broad unwanted match
  const ignoreWords = ["كليه", "مركز", "مبني", "مبنى", "قسم", "ساحه", "دوار"];
  const pinWords = pinName
    .split(" ")
    .filter((w) => w.length >= 2 && !ignoreWords.includes(w));
  const reportWords = reportLoc
    .split(" ")
    .filter((w) => w.length >= 2 && !ignoreWords.includes(w));

  for (const pWord of pinWords) {
    if (reportWords.includes(pWord)) return true;
  }

  if (
    pin.bid === 8 &&
    (reportLoc.includes("هندسه") ||
      reportLoc.includes("تقنيه") ||
      reportLoc.includes("اي تي") ||
      reportLoc.includes("it"))
  )
    return true;
  if (pin.bid === 22 && reportLoc.includes("طب")) return true;
  if (pin.bid === 20 && reportLoc.includes("مكتب")) return true;
  if (pin.bid === 14 && reportLoc.includes("بيضا")) return true;
  if (pin.bid === 17 && reportLoc.includes("تركي")) return true;

  return false;
};

const svgToPercent = (cx: number, cy: number) => ({
  left: (cx / SVG_W) * 100,
  top: (cy / SVG_H) * 100,
});

export function EmergencyMapView({
  reports,
  expandedId,
  onMarkerPress,
}: MapViewProps) {
  const selectedReport = reports.find((r) => r.id === expandedId) ?? null;

  let popupPos: { left: number; top: number } | null = null;
  if (selectedReport) {
    let pin = BUILDINGS.find((p) => checkPinMatch(p, selectedReport));
    if (!pin) pin = { bid: -1, name: "غير محدد", cx: 30, cy: 15 };
    const idx = reports.findIndex((r) => r.id === selectedReport.id);
    const prior = reports.slice(0, idx).filter((r) => {
      let p = BUILDINGS.find((b) => checkPinMatch(b, r));
      if (!p) p = { bid: -1, name: "غير محدد", cx: 30, cy: 15 };
      return p.bid === pin!.bid;
    });
    const cx = pin.cx + prior.length * 10;
    const cy = pin.cy;
    popupPos = svgToPercent(cx, cy);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <ScrollView
          style={styles.mapScroll}
          contentContainerStyle={styles.mapScrollContent}
        >
          <Svg
            width="100%"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={styles.svg}
          >
            <SvgImage
              href={require("../../../assets/images/map.png")}
              x="0"
              y="0"
              width={SVG_W}
              height={SVG_H}
              preserveAspectRatio="xMidYMid slice"
              onPress={() => onMarkerPress(null)}
            />
            {reports.map((report, index) => {
              let matchedPin = BUILDINGS.find((pin) =>
                checkPinMatch(pin, report),
              );
              if (!matchedPin) {
                matchedPin = { bid: -1, name: "غير محدد", cx: 30, cy: 15 };
              }

              const priorReportsSamePin = reports
                .slice(0, index)
                .filter((r) => {
                  let p = BUILDINGS.find((b) => checkPinMatch(b, r));
                  if (!p) p = { bid: -1, name: "غير محدد", cx: 30, cy: 15 };
                  return p.bid === matchedPin!.bid;
                });
              const offset = priorReportsSamePin.length * 10;

              const cx = matchedPin.cx + offset;
              const cy = matchedPin.cy;
              const color = getStatusColor(report.status);
              const isSelected = report.id === expandedId;

              return (
                <G
                  key={report.id}
                  onPress={() => onMarkerPress(isSelected ? null : report.id)}
                >
                  <Circle
                    cx={cx}
                    cy={cy}
                    r="9"
                    fill={color}
                    opacity="0.2"
                    pointerEvents="none"
                  />
                  <Circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill={color}
                    pointerEvents="none"
                  />
                  <SvgText
                    x={cx}
                    y={cy + 2}
                    textAnchor="middle"
                    fontSize="6"
                    fontWeight="700"
                    fontFamily="System"
                    fill="#fff"
                    pointerEvents="none"
                  >
                    !
                  </SvgText>
                  {isSelected && (
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={12}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      pointerEvents="none"
                    />
                  )}
                  <Circle cx={cx} cy={cy} r="15" fill="transparent" />
                </G>
              );
            })}
          </Svg>
        </ScrollView>

        {selectedReport && popupPos && (
          <PinPopup
            report={selectedReport}
            leftPercent={popupPos.left}
            topPercent={popupPos.top}
            onClose={() => onMarkerPress(null)}
          />
        )}
      </View>

      <View style={styles.legend}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                item.circle && styles.legendCircle,
                { backgroundColor: item.color },
              ]}
            />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface PinPopupProps {
  report: Report;
  leftPercent: number;
  topPercent: number;
  onClose: () => void;
}

function PinPopup({ report, leftPercent, topPercent, onClose }: PinPopupProps) {
  const statusColor = getStatusColor(report.status);
  const showAbove = topPercent > 50;

  return (
    <View
      style={[
        styles.popup,
        {
          left: `${Math.min(Math.max(leftPercent, 5), 60)}%` as DimensionValue,
          top: `${topPercent}%` as DimensionValue,
          transform: showAbove
            ? [{ translateX: -10 }, { translateY: -110 }]
            : [{ translateX: -10 }, { translateY: 14 }],
        },
      ]}
    >
      <View
        style={[styles.tail, showAbove ? styles.tailBottom : styles.tailTop]}
      />
      <View style={styles.popupHeader}>
        <Text style={styles.popupType}>
          {getTypeLabel(report.type as EmergencyType)}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.popupClose}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.popupLocation} numberOfLines={1}>
        📍 {report.location}
      </Text>
      <Text style={styles.popupDesc} numberOfLines={2}>
        {report.description}
      </Text>
      <View
        style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusLabel(report.status as ReportStatus)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapScroll: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
  },
  svg: {
    width: "100%",
    aspectRatio: SVG_W / SVG_H,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
  popup: {
    position: "absolute",
    width: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 999,
  },
  tail: {
    position: "absolute",
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailBottom: {
    bottom: -8,
    borderTopWidth: 8,
    borderTopColor: COLORS.surface,
  },
  tailTop: {
    top: -8,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.surface,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  popupType: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
  },
  popupClose: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingLeft: 6,
  },
  popupLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginBottom: 4,
  },
  popupDesc: {
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 16,
    textAlign: "right",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sheetResolveBtn: {
    marginTop: 16,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sheetResolveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
