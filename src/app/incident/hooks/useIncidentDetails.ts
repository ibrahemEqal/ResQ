import { Alert, useState } from 'react';
import { statusArabic } from '../utils/statusMap';
import { formatDate } from '../utils/formatDate';

type Report = {
  status: string;
  createdAt: string;
};

type TimelineItem = {
  status: string;
  time: string;
  note: string;
};

export function useIncidentDetails(report: Report) {
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [assignedResponder, setAssignedResponder] = useState('غير معين');

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      status: 'تم إنشاء البلاغ',
      time: formatDate(report.createdAt),
      note: 'تم إنشاء البلاغ من قبل المستخدم',
    },
    {
      status: 'تمت مراجعة البلاغ',
      time: formatDate(report.createdAt),
      note: 'تمت مراجعة البلاغ من قبل الإدارة',
    },
  ]);

  const handleAssignResponder = () => {
    const responderName = 'فريق الاستجابة';
    setAssignedResponder(responderName);

    setTimeline((prev) => [
      ...prev,
      {
        status: 'تم التعيين',
        time: formatDate(new Date().toISOString()),
        note: `تم تعيين البلاغ إلى ${responderName}`,
      },
    ]);

    Alert.alert('تم التعيين', `تم تعيين ${responderName}`);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setCurrentStatus(newStatus);

    setTimeline((prev) => [
      ...prev,
      {
        status: statusArabic[newStatus] || newStatus,
        time: formatDate(new Date().toISOString()),
        note: `تم تحديث الحالة إلى ${statusArabic[newStatus] || newStatus}`,
      },
    ]);

    Alert.alert(
      'تم التحديث',
      `الحالة أصبحت ${statusArabic[newStatus] || newStatus}`
    );
  };

  return {
    currentStatus,
    assignedResponder,
    timeline,
    handleAssignResponder,
    handleUpdateStatus,
  };
}