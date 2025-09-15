import { WeeklyReport } from '../types';
import { UrgentIssue } from '../types';
import { isoYearWeek } from '../utils/week-mapping';
import { customYearWeek, getSundayOfCustomWeek } from '../utils/week-mapping';
import { getMondayOfWeekISO } from '../utils/iso-week';

export const businessUnits = [
  { id: '1', name: 'Next Generation Infrastructure', color: 'bg-blue-100 border-blue-200' },
  { id: '2', name: 'IP\'s', color: 'bg-indigo-100 border-indigo-200' },
  { id: '3', name: 'ERP', color: 'bg-purple-100 border-purple-200' },
  { id: '4', name: 'Enterprise Solutions', color: 'bg-green-100 border-green-200' },
  { id: '5', name: 'Back Office & Support', color: 'bg-orange-100 border-orange-200' },
  { id: '6', name: 'Sales', color: 'bg-red-100 border-red-200' },
];

export const divisions = {
  '1': [
    { id: '1', name: 'Cloud & Digital Services' },
    { id: '2', name: 'Data Driven Infrastructure' },
    { id: '3', name: 'Defense Solutions' }
  ],
  '2': [
    { id: '4', name: 'AMAN' },
    { id: '5', name: 'Image Links' },
    { id: '6', name: 'AccuLab' }
  ],
  '3': [
    { id: '7', name: 'Oracle Fusion' },
    { id: '8', name: 'Oracle Technologies & DB' }
  ],
  '4': [
    { id: '9', name: 'Data & AI' }
  ],
  '5': [
    { id: '10', name: 'Human Resources' },
    { id: '11', name: 'Supply Chain' },
    { id: '12', name: 'PMO' },
    { id: '13', name: 'R&D' },
    { id: '14', name: 'Finance' }
  ],
  '6': [
    { id: '15', name: 'Jordan Sales' },
    { id: '16', name: 'Saudi Sales' }
  ]
};

export const sampleReports: WeeklyReport[] = [
  // Week 26 reports (June 23-27, 2025) - Monday to Friday
  {
    id: '1',
    businessUnit: 'Back Office & Support',
    division: 'Human Resources',
    week: '2025-06-23', // Monday of week 26
    urgentIssues: [
      {
        id: '1',
        description: 'Two key developers submitted resignation letters. Need urgent retention strategy and replacement hiring plan.',
        timestamp: new Date('2025-06-27T09:00:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Jennifer Davis'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Launched new employee wellness program with 95% participation rate. Positive feedback from all departments.',
    businessDevelopment: 'Partnered with local university for internship program. Exploring remote work policy expansion to access global talent.',
    plannedActivities: 'Conduct retention interviews, post job openings, finalize Q1 performance review process, organize team building event.',
    submittedAt: new Date('2025-06-27T10:30:00'),
    submittedBy: 'Jennifer Davis'
  },
  {
    id: '2',
    businessUnit: 'Next Generation Infrastructure',
    division: 'Cloud & Digital Services',
    week: '2025-06-23',
    urgentIssues: [
      {
        id: '2',
        description: 'Critical security vulnerability discovered in authentication system. Patch needs immediate deployment to production.',
        timestamp: new Date('2025-06-25T14:30:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Alex Rodriguez'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Successfully migrated 90% of infrastructure to new cloud provider, reducing costs by 30% while improving performance.',
    businessDevelopment: 'Evaluating AI integration opportunities for our core product. Researching partnership with machine learning platform.',
    plannedActivities: 'Deploy security patch, complete infrastructure migration, begin development of mobile app MVP, code review for new features.',
    submittedAt: new Date('2025-06-25T15:45:00'),
    submittedBy: 'Alex Rodriguez'
  },
  {
    id: '3',
    businessUnit: 'Sales',
    division: 'Jordan Sales',
    week: '2025-06-23',
    urgentIssues: [
      {
        id: '3',
        description: 'Client A is threatening to cancel their contract due to delayed delivery. Need immediate support from product team to address their concerns.',
        timestamp: new Date('2025-06-24T08:15:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Sarah Johnson'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Closed $2.5M deal with Enterprise Corp after 6 months of negotiations. Team exceeded quarterly targets by 15%.',
    businessDevelopment: 'Initiated conversations with 3 potential Fortune 500 clients. Attending industry conference next week to generate new leads.',
    plannedActivities: 'Follow up with Enterprise Corp onboarding, resolve Client A issues, prepare Q1 sales strategy presentation for board meeting.',
    submittedAt: new Date('2025-06-24T09:15:00'),
    submittedBy: 'Sarah Johnson'
  },
  {
    id: '4',
    businessUnit: 'Enterprise Solutions',
    division: '',
    week: '2025-06-23',
    urgentIssues: [
      {
        id: '4',
        description: 'Website experiencing 40% slower load times affecting conversion rates. SEO rankings dropped for key terms.',
        timestamp: new Date('2025-06-27T13:20:00'),
        requiresAction: false,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Mike Chen'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Launched new brand campaign resulting in 200% increase in social media engagement. Featured in TechCrunch article.',
    businessDevelopment: 'Partnership discussions with 2 major influencers for Q1 campaign. Exploring co-marketing opportunities with complementary SaaS companies.',
    plannedActivities: 'Fix website performance issues, launch email nurture sequence, prepare content calendar for February product launch.',
    submittedAt: new Date('2025-06-27T14:20:00'),
    submittedBy: 'Mike Chen'
  },
  // Week 27 reports (June 30 - July 4, 2025) - Monday to Friday
  {
    id: '5',
    businessUnit: 'Back Office & Support',
    division: 'Finance',
    week: '2025-06-30', // Monday of week 27
    urgentIssues: [
      {
        id: '5',
        description: 'Mid-year financial reporting deadline approaching. Need all department expense reports by Friday.',
        timestamp: new Date('2025-07-04T10:00:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Robert Kim'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Successfully reduced operational costs by 12% through vendor renegotiations and process optimization.',
    businessDevelopment: 'Exploring new financial software solutions to streamline accounting processes and improve reporting accuracy.',
    plannedActivities: 'Complete mid-year financial statements, prepare budget proposals for Q3, conduct financial audit preparation.',
    submittedAt: new Date('2025-07-04T11:00:00'),
    submittedBy: 'Robert Kim'
  },
  {
    id: '6',
    businessUnit: 'ERP',
    division: 'Oracle Fusion',
    week: '2025-06-30',
    urgentIssues: [
      {
        id: '6',
        description: 'ERP system integration with new CRM causing data synchronization issues. Customer orders being delayed.',
        timestamp: new Date('2025-07-02T15:30:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Maria Santos'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Successfully implemented automated inventory management reducing manual errors by 85%.',
    businessDevelopment: 'Evaluating next-generation ERP modules for enhanced business intelligence and analytics capabilities.',
    plannedActivities: 'Fix CRM integration issues, train staff on new inventory system, plan ERP system upgrade roadmap.',
    submittedAt: new Date('2025-07-02T16:30:00'),
    submittedBy: 'Maria Santos'
  },
  // Week 28 reports (July 7-11, 2025) - Monday to Friday
  {
    id: '7',
    businessUnit: 'IP\'s',
    division: 'AMAN',
    week: '2025-07-07', // Monday of week 28
    urgentIssues: [
      {
        id: '7',
        description: 'Server downtime affecting customer access to AMAN platform. Need immediate infrastructure support.',
        timestamp: new Date('2025-07-11T08:30:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Ahmed Hassan'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Launched new AMAN mobile app with 1000+ downloads in first week. Excellent user feedback.',
    businessDevelopment: 'Exploring partnerships with regional security companies. Potential expansion into new markets.',
    plannedActivities: 'Resolve server issues, plan mobile app feature updates, conduct market research for expansion.',
    submittedAt: new Date('2025-07-11T09:30:00'),
    submittedBy: 'Ahmed Hassan'
  },
  // Week 29 reports (July 14-18, 2025) - Monday to Friday
  {
    id: '8',
    businessUnit: 'Next Generation Infrastructure',
    division: 'Defense Solutions',
    week: '2025-07-14', // Monday of week 29
    urgentIssues: [
      {
        id: '8',
        description: 'Critical deadline for defense contract deliverables. Need additional resources to meet timeline.',
        timestamp: new Date('2025-07-18T13:15:00'),
        requiresAction: true,
        isCompleted: false,
        status: 'Pending',
        submittedBy: 'Colonel Smith'
      }
    ] as UrgentIssue[],
    highlightOfWeek: 'Successfully passed security audit for defense systems. All compliance requirements met.',
    businessDevelopment: 'Bidding on new government contracts. Strengthening partnerships with defense contractors.',
    plannedActivities: 'Complete contract deliverables, prepare for next audit cycle, submit new contract proposals.',
    submittedAt: new Date('2025-07-18T14:15:00'),
    submittedBy: 'Colonel Smith'
  }
];

export function getWeekOptions(): { value: string; label: string }[] {
  const weeks = [...new Set(sampleReports.map(r => r.week))].sort((a, b) => b.localeCompare(a));
  
  return weeks.map(week => ({
    value: week,
    label: formatWeekLabel(week)
  }));
}

export function formatWeekLabel(weekStart: string): string {
  const sundayDate = new Date(weekStart + 'T00:00:00Z');
  const thursdayDate = new Date(sundayDate.getTime() + 4 * 24 * 60 * 60 * 1000); // Sunday to Thursday (5 days)
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = sundayDate.toLocaleDateString('en-US', options);
  const end = thursdayDate.toLocaleDateString('en-US', options);
  
  return `${start} - ${end}, ${sundayDate.getFullYear()}`;
}

export function getCurrentWeek(): string {
  const today = new Date();
  console.log('getCurrentWeek - Today (local):', today.toString());
  console.log('getCurrentWeek - Today (ISO):', today.toISOString());
  console.log('getCurrentWeek - Today date parts:', {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    day: today.getDay() // 0=Sunday, 1=Monday, etc.
  });
  
  // Get the current custom week (Sunday-Thursday)
  const { year, week } = customYearWeek(today);
  console.log('getCurrentWeek - Current custom week:', { year, week });
  
  // Get the Sunday of this custom week
  const sundayOfCurrentWeek = getSundayOfCustomWeek(year, week);
  console.log('getCurrentWeek - Sunday of current custom week:', sundayOfCurrentWeek.toISOString());
  
  // Format as YYYY-MM-DD (Sunday)
  const sundayStr = sundayOfCurrentWeek.toISOString().split('T')[0];
  console.log('getCurrentWeek - Returning Sunday string:', sundayStr);
  
  return sundayStr;
}

// Sample user data - in a real app, this would come from authentication
export const currentUser = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@company.com',
  role: 'CEO' as const, // Change this to test different roles: 'CEO' | 'BU_HEAD' | 'DIVISION_HEAD' | 'EMPLOYEE'
  allowedBusinessUnits: ['Next Generation Infrastructure', 'Sales'], // Only used if not CEO
  allowedDivisions: ['Cloud & Digital Services', 'Jordan Sales'] // Only used if not CEO
};