import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { Report } from '../../../types';

export function useDashboard() {
    const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });
    const [recentLogs, setRecentLogs] = useState<Report[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let open = 0, critical = 0, resolved = 0;
            const logs: any[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === 'Open' || data.status === 'In Progress') open++;
                if (data.priority === 'High' || data.status === 'Critical') critical++;
                if (data.status === 'Resolved') resolved++;
                if (logs.length < 5) logs.push({ id: doc.id, ...data });
            });

            setStats({ open, critical, resolved });
            setRecentLogs(logs);
        });

        return () => unsubscribe();
    }, []);

    return { stats, recentLogs };
}