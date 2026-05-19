const pushMock = jest.fn();

// لازم يكون قبل الاستيراد
jest.resetModules();

jest.doMock("expo-router", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.doMock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    isDark: false,
  }),
}));

jest.doMock("react-native-gesture-handler/ReanimatedSwipeable", () => {
  return function Mock({ children }: any) {
    return children;
  };
});

jest.doMock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import ReportCard from "../report/ReportCard";

const mockReport = {
  id: "101",
  userId: "USER-1",
  type: "Fire" as const,
  description: "دخان داخل كلية العلوم",
  location: "كلية العلوم",
  status: "Open" as const,
  createdAt: "2026-05-18T10:00:00.000Z",
};

describe("ReportCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("يعرض بيانات البلاغ بشكل صحيح", () => {
    const { getByText } = render(<ReportCard report={mockReport} />);

    expect(getByText("تقرير Fire")).toBeTruthy();
    expect(getByText("كلية العلوم")).toBeTruthy();
    expect(getByText("مفتوح")).toBeTruthy();
  });

  it("ينتقل إلى تفاصيل البلاغ عند الضغط", () => {
    const { getByText } = render(<ReportCard report={mockReport} />);

    fireEvent.press(getByText("تقرير Fire"));

    expect(pushMock).toHaveBeenCalledWith("/incident/101");
  });

  it("يعرض Alert عند الحذف", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByText } = render(
      <ReportCard report={mockReport} onDelete={jest.fn()} />,
    );

    fireEvent.press(getByText("حذف"));

    expect(alertSpy).toHaveBeenCalled();
  });

  it("ينفذ الحذف عند التأكيد", () => {
    const onDeleteMock = jest.fn();

    jest.spyOn(Alert, "alert").mockImplementation((_t, _m, buttons: any) => {
      buttons[1].onPress();
    });

    const { getByText } = render(
      <ReportCard report={mockReport} onDelete={onDeleteMock} />,
    );

    fireEvent.press(getByText("حذف"));

    expect(onDeleteMock).toHaveBeenCalledWith("101");
  });

  it("يترجم الحالة بشكل صحيح", () => {
    const resolvedReport = {
      ...mockReport,
      status: "Resolved" as const,
    };

    const { getByText } = render(<ReportCard report={resolvedReport} />);

    expect(getByText("مكتمل")).toBeTruthy();
  });
});
