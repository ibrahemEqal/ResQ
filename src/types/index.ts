export type UserRole = "student"  | "responder" | "admin";

export interface User {
  uid: string;
  fullName: string;
  email: string;
  universityId: string;
  role: UserRole;
}

export type EmergencyType =
  | "Fire"
  | "Fainting"
  | "Security"
  | "Electrical"
  | "Injury"
  | "Other";

export type ReportPriority = "Low" | "Medium" | "High" | "Critical";

export type ReportStatus = "Open" | "In Progress" | "Resolved" | "Critical";

export interface Report {
  id: string;
  userId: string;
  type: EmergencyType;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  priority?: ReportPriority;
  status: ReportStatus;
  createdAt: string | Date;
}
