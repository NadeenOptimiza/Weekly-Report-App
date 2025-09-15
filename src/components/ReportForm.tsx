@@ .. @@
     const newIssue: UrgentIssue = {
       id: Date.now().toString(),
       description: newIssueText.trim(),
       timestamp: new Date(),
       requiresAction: newIssueRequiresAction,
       isCompleted: false,
+      status: 'Pending',
       submittedBy: submittedBy
     };