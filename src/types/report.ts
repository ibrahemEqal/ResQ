export type EmergencyCategory =
    | 'fire'
    | 'fainting'
    | 'injury'
    | 'security'
    | 'electrical';

export type EmergencyStatus =
    | 'new'
    | 'under_review'
    | 'assigned'
    | 'in_progress'
    | 'resolved'
    | 'closed';

export type EmergencyPriority = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyReport {
    id: string;
    title: string;
    description: string;
    category: EmergencyCategory;
    status: EmergencyStatus;
    priority: EmergencyPriority;
    locationText: string;
    createdAt: string;
}