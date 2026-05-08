import { db } from '@/config/firebaseConfig';
import { Report } from '@/types';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const EMPTY_STATS = { open: 0, critical: 0, resolved: 0 };

export function useDashboard(enabled = true) {
    const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });
    const [recentLogs, setRecentLogs] = useState<Report[]>([]);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setStats(EMPTY_STATS);
            setRecentLogs([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let open = 0, critical = 0, resolved = 0;
            const logs: Report[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === 'Open' || data.status === 'In Progress') open++;
                if (data.priority === 'High' || data.status === 'Critical') critical++;
                if (data.status === 'Resolved') resolved++;
                if (logs.length < 5) logs.push({ id: doc.id, ...data } as Report);
            });

            setStats({ open, critical, resolved });
            setRecentLogs(logs);
            setLoading(false);
        }, (snapshotError) => {
            console.error('Error loading dashboard reports:', snapshotError);
            setStats(EMPTY_STATS);
            setRecentLogs([]);
            setError('تعذر تحميل بيانات لوحة القيادة');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [enabled]);

    return { stats, recentLogs, loading, error };
}
