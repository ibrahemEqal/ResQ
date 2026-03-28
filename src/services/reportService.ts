import { Report } from '../types';
import { fetchMockReports, createMockReport } from '../data/mockData';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
const USE_MOCK_DATA = true;

export const getReports = async (): Promise<Report[]> => {
    if (USE_MOCK_DATA) {
        return await fetchMockReports();
    } else {
        const querySnapshot = await getDocs(collection(db, 'reports'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    }
};
export const getReportsByUser = async (userId: string): Promise<Report[]> => {
    if (USE_MOCK_DATA) {
        const allReports = await fetchMockReports();
        return allReports.filter(report => report.userId === userId);
    } else {
        const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Report[];
    }
};


export const submitReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
    if (USE_MOCK_DATA) {
        return await createMockReport(reportData);
    } else {
        const docRef = await addDoc(collection(db, 'reports'), {
            ...reportData,
            status: 'Open',
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    }
};