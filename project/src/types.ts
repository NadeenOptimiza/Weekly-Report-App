export interface WeeklyReport {
  id: string;
  businessUnit: string;
  division: string;
  week: string;          // "Wxx-YYYY"
  isoYear?: number;
  isoWeek?: number;
  urgentIssues: UrgentIssue[];
  highlightOfWeek: string;
  businessDevelopment: string;
  plannedActivities: string;
  submittedAt: Date;
  submittedBy: string;
}

export interface UrgentIssue {
  id: string;
  description: string;
  timestamp: Date;
  requiresAction: boolean;
  isCompleted: boolean;
  status: 'Pending' | 'Noted' | 'Completed';
  completedAt?: Date;
  completedBy?: string;
  submittedBy: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  color: string;
}

export interface Division {
  id: string;
  name: string;
  business_unit_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'BU_HEAD' | 'DIVISION_HEAD' | 'EMPLOYEE';
  allowedBusinessUnits: string[];
  allowedDivisions: string[];
}