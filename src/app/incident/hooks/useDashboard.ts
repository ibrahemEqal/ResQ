import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Report } from '@/types';

const fetchDashboardData = async () => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    let open = 0, critical = 0, resolved = 0;
    const logs: Report[] = [];

    snapshot.forEach((doc) => {
        const firebaseData = doc.data() as Report;
        const { id, ...restOfData } = firebaseData;

        if (firebaseData.status === 'Open' || firebaseData.status === 'In Progress') open++;
        if (firebaseData.priority === 'High' || firebaseData.priority === 'Critical') critical++;
        if (firebaseData.status === 'Resolved') resolved++;

        if (logs.length < 5) {
            logs.push({
                id: doc.id,
                ...restOfData
            } as Report);
        }
    });

    return { stats: { open, critical, resolved }, recentLogs: logs };
};

export function useDashboard() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardData,
        staleTime: 1000 * 60 * 2,
    });

    return {
        stats: data?.stats || { open: 0, critical: 0, resolved: 0 },
        recentLogs: data?.recentLogs || [],
        isLoading,
        isError,
        refetch
    };
}