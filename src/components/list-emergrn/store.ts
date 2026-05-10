import { getReports, markReportAsResolved } from '@/services/reportService';
import { auth } from '@/config/firebaseConfig';
import { currentUserIsAdmin } from '@/services/roleService';
import { EmergencyType, Report, ReportStatus } from '@/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
export type FilterType   = 'All' | EmergencyType;
export type FilterStatus = 'All' | ReportStatus;
export const TYPE_FILTERS: FilterType[] = [
  'All', 'Fire', 'Fainting', 'Security', 'Electrical', 'Injury', 'Other',
];
export const STATUS_FILTERS: FilterStatus[] = [
  'All', 'Critical', 'Open', 'In Progress', 'Resolved',
];
export const getStatusColor = (status: ReportStatus): string => {
  switch (status) {
    case 'Critical':    return '#FF3B30'; 
    case 'Open':        return '#FF9500'; 
    case 'In Progress': return '#007AFF'; 
    case 'Resolved':    return '#34C759'; 
    default:            return '#8E8E93'; 
  }
};
export const getStatusLabel = (status: ReportStatus): string => {
  switch (status) {
    case 'Critical':    return 'حرج';
    case 'Open':        return 'مفتوح';
    case 'In Progress': return 'قيد المعالجة';
    case 'Resolved':    return 'تم الحل';
    default:            return status;
  }
};
export const getTypeLabel = (type: EmergencyType): string => {
  switch (type) {
    case 'Fire':       return '🔥 حريق';
    case 'Fainting':   return '🏥 إغماء';
    case 'Security':   return '🔒 أمني';
    case 'Electrical': return '⚡ كهربائي';
    case 'Injury':     return '🩹 إصابة';
    case 'Other':      return '⚠️ أخرى';
    default:           return type;
  }
};
export const getTimeAgo = (dateStr: string | Date): string => {
  const date     = new Date(dateStr);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1)  return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)  return `منذ ${diffHrs} ساعة`;
  return `منذ ${Math.floor(diffHrs / 24)} يوم`;
};
export interface LiveEmergencyStore {
  reports:          Report[];
  filteredReports:  Report[];
  loading:          boolean;
  refreshing:       boolean;
  error:            string | null;
  viewMode:         'list' | 'map';
  setViewMode:      (mode: 'list' | 'map') => void;
  searchQuery:      string;
  setSearchQuery:   (q: string) => void;
  selectedType:     FilterType;
  setSelectedType:  (t: FilterType) => void;
  selectedStatus:   FilterStatus;
  setSelectedStatus:(s: FilterStatus) => void;
  expandedId:       string | null;
  setExpandedId:    (id: string | null) => void;
  canResolveReports:boolean;
  loadReports:      () => Promise<void>;
  handleRefresh:    () => void;
  resolveReport:    (id: string) => Promise<void>;
}

function getReadyUser() {
  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export function useLiveEmergencyStore(): LiveEmergencyStore {
  const [reports,        setReports]        = useState<Report[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [viewMode,       setViewMode]       = useState<'list' | 'map'>('list');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedType,   setSelectedType]   = useState<FilterType>('All');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('All');
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [canResolveReports, setCanResolveReports] = useState(false);
  const loadReports = async () => {
    const currentUser = await getReadyUser();

    if (!currentUser) {
      setReports([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch {
      setError('فشل في تحميل البلاغات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };
  const resolveReport = async (id: string) => {
    if (!canResolveReports) {
      alert("هذه الصلاحية متاحة للأدمن فقط.");
      return;
    }

    const success = await markReportAsResolved(id);
    if (success) {
      loadReports(); 
    } else {
      alert("فشل في تحديث حالة البلاغ.");
    }
  };
  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 30_000);
    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) setCanResolveReports(false);
        return;
      }

      if (active) setCanResolveReports(await currentUserIsAdmin());
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return reports.filter((r) => {
      const matchesSearch =
        q === '' ||
        r.location.toLowerCase().includes(q)    ||
        r.description.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);
      const matchesType   = selectedType   === 'All' || r.type   === selectedType;
      const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, selectedType, selectedStatus]);
  return {
    reports,
    filteredReports,
    loading,
    refreshing,
    error,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    expandedId,
    setExpandedId,
    canResolveReports,
    loadReports,
    handleRefresh,
    resolveReport,
  };
}
