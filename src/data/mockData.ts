import { EmergencyReport } from '@/types/report';

export const mockReports: EmergencyReport[] = [
    {
        id: '1',
        title: 'Fire in Lab 2',
        description: 'Smoke seen near electrical panel',
        category: 'fire',
        status: 'new',
        priority: 'critical',
        locationText: 'Engineering Building - Lab 2',
        createdAt: '2026-03-21T10:30:00Z',
    },
];