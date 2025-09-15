@@ .. @@
           // Ensure each issue has the required properties for the new structure
           urgentIssues = urgentIssues.map(issue => ({
             id: issue.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
             description: issue.description || '',
             timestamp: issue.timestamp ? new Date(issue.timestamp) : new Date(),
             requiresAction: issue.requiresAction || false,
             isCompleted: issue.isCompleted === true,
             status: issue.status || (issue.isCompleted ? 'Completed' : (issue.completedBy ? 'Noted' : 'Pending')),
             completedAt: (issue.completedAt && !isNaN(new Date(issue.completedAt).getTime())) ? new Date(issue.completedAt) : undefined,
             completedBy: issue.completedBy || undefined,
             submittedBy: issue.submittedBy || 'Unknown'
           }));

         // Handle legacy text format - convert to new structure
         urgentIssues = [{
           id: Date.now().toString(),
           description: trimmedUrgent,
           timestamp: new Date(),
           requiresAction: false,
           isCompleted: false,
           status: 'Pending',
           submittedBy: db.submitted_by || 'Unknown'
         }];
       }
@@ .. @@
       urgentIssues = [{
         id: Date.now().toString(),
         description: db.urgent.trim(),
         timestamp: new Date(),
         requiresAction: false,
         isCompleted: false,
         status: 'Pending',
         submittedBy: db.submitted_by || 'Unknown'
       }];
     } else {