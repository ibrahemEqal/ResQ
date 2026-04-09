import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { statusArabic } from '../utils/statusMap';
import { formatDate } from '../utils/formatDate';

const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

type TimelineItem = {
  status: string;
  time: string;
  note: string;
};

type IncidentReport = {
  id: string;
  type: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedResponder?: string;
  timeline?: TimelineItem[];
};

export function useIncidentDetails(id?: string | string[]) {
  const incidentId = Array.isArray(id) ? id[0] : id;

  const [report, setReport] = useState<IncidentReport | null>(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [assignedResponder, setAssignedResponder] = useState('غير معين');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!incidentId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'reports', incidentId);
        const docSnap = await getDoc(docRef);
        console.log('exists:', docSnap.exists(), 'id:', incidentId);

        if (!docSnap.exists()) {
          setReport(null);
          setLoading(false);
          return;
        }

        const data = { id: docSnap.id, ...docSnap.data() } as IncidentReport;

        setReport(data);
        setCurrentStatus(data.status || '');
        setAssignedResponder(data.assignedResponder || 'غير معين');

        if (data.timeline && data.timeline.length > 0) {
          setTimeline(data.timeline);
        } else {
          setTimeline([
            {
              status: 'تم إنشاء البلاغ',
              time: formatDate(data.createdAt),
              note: 'تم إنشاء البلاغ من قبل المستخدم',
            },
          ]);
        }
      } catch (error) {
        console.log('Error fetching incident:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  const handleAssignResponder = async () => {
    if (!incidentId) return;

    const responderName = 'فريق الاستجابة';

    const newTimelineItem: TimelineItem = {
      status: 'تم التعيين',
      time: formatDate(new Date().toISOString()),
      note: `تم تعيين البلاغ إلى ${responderName}`,
    };

    try {
      await updateDoc(doc(db, 'reports', incidentId), {
        assignedResponder: responderName,
        timeline: arrayUnion(newTimelineItem),
      });

      setAssignedResponder(responderName);
      setTimeline((prev) => [...prev, newTimelineItem]);
      showAlert('تم التعيين', `تم تعيين ${responderName}`);
    } catch (error) {
      console.log('Error assigning responder:', error);
      showAlert('خطأ', 'فشل في تعيين المسؤول');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!incidentId) return;

    const newTimelineItem: TimelineItem = {
      status: statusArabic[newStatus] || newStatus,
      time: formatDate(new Date().toISOString()),
      note: `تم تحديث الحالة إلى ${statusArabic[newStatus] || newStatus}`,
    };

    try {
      await updateDoc(doc(db, 'reports', incidentId), {
        status: newStatus,
        timeline: arrayUnion(newTimelineItem),
      });

      setCurrentStatus(newStatus);
      setTimeline((prev) => [...prev, newTimelineItem]);
      showAlert('تم التحديث', `الحالة أصبحت ${statusArabic[newStatus] || newStatus}`);
    } catch (error) {
      console.log('Error updating status:', error);
      showAlert('خطأ', 'فشل في تحديث الحالة');
    }
  };

  return {
    report,
    currentStatus,
    assignedResponder,
    timeline,
    handleAssignResponder,
    handleUpdateStatus,
    loading,
  };
}