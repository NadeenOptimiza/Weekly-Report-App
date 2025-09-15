@@ .. @@
 export interface UrgentIssue {
   id: string;
   description: string;
   timestamp: Date;
   requiresAction: boolean;
   isCompleted: boolean;
+  status: 'Pending' | 'Noted' | 'Completed';
   completedAt?: Date;
   completedBy?: string;
   submittedBy: string;
 }