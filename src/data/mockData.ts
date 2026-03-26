import { Report, EmergencyType, ReportStatus } from '../types';

export const MOCK_TIPS = [
    {
        id: '1',
        category: 'Fire',
        title: 'حريق في المبنى',
        do: ['استخدم أقرب مخرج طوارئ', 'اتصل بالدفاع المدني فوراً', 'استخدم الدرج ولا تستخدم المصعد'],
        dont: ['لا تحاول إطفاء الحريق إذا كان كبيراً', 'لا تعد لأخذ مقتنياتك الشخصية'],
    },
    {
        id: '2',
        category: 'Fainting',
        title: 'حالة إغماء',
        do: ['تأكد من مجرى التنفس', 'ارفع قدمي المصاب قليلاً', 'اتصل بالعيادة الجامعية'],
        dont: ['لا تحاول إعطاءه ماء أو طعام وهو فاقد للوعي', 'لا تحركه بعنف'],
    },
    {
        id: '3',
        category: 'Security',
        title: 'مشكلة أمنية',
        do: ['ابتعد عن مصدر الخطر بهدوء', 'أبلغ أمن الجامعة فوراً', 'ابق في مكان آمن ومغلق'],
        dont: ['لا تتدخل بنفسك لحل المشكلة', 'لا تقم بتصوير المعتدين إذا كان ذلك يعرضك للخطر'],
    }
];

export const MOCK_REPORTS_SUMMARY = {
    open: 12,
    critical: 3,
    resolved: 45,
    recent: [
        { id: '101', type: 'Fire', location: 'مبنى الهندسة - الطابق الثاني', status: 'Critical', time: '10 mins ago' },
        { id: '102', type: 'Fainting', location: 'مكتبة الجامعة', status: 'Open', time: '25 mins ago' },
        { id: '103', type: 'Security', location: 'الساحة الرئيسية', status: 'Open', time: '1 hour ago' },
    ]
};

export const MOCK_REPORTS: Report[] = [
    {
        id: 'REP-1001',
        userId: 'USER-123',
        type: 'Fire',
        description: 'دخان كثيف يخرج من مختبر الكيمياء.',
        location: 'مبنى العلوم - الطابق الثالث',
        status: 'Critical',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 'REP-1002',
        userId: 'USER-456',
        type: 'Fainting',
        description: 'طالب فقد الوعي في الساحة.',
        location: 'الساحة الرئيسية - قرب الكافتيريا',
        status: 'Open',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchMockReports = async (): Promise<Report[]> => {
    await delay(1200);
    return MOCK_REPORTS;
};

export const createMockReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> => {
    await delay(1500);
    const newReport: Report = {
        ...reportData,
        id: `REP-${Math.floor(Math.random() * 10000)}`,
        status: 'Open',
        createdAt: new Date().toISOString(),
    };
    MOCK_REPORTS.unshift(newReport);
    return newReport;
};