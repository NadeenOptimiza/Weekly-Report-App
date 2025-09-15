import { useState, useEffect } from 'react';
import { WeeklyReport, BusinessUnit, UrgentIssue } from '../types';
import { useAuth } from './useAuth';
import {
  getBusinessUnits,
  getDivisions,
  getWeeklyReports,
  getWeeklyReportsByWeek,
  submitWeeklyReportViaRpc,
  getSingleWeeklyReport,
  type DatabaseBusinessUnit,
  type DatabaseDivision,
  type WeeklyReportWithDetails
} from '../services/database';
import { customWeekKeyFromDate, parseWeekKeyToCustom } from '../utils/week-mapping';

// --- helpers ---
function convertToFrontendReport(db: WeeklyReportWithDetails): WeeklyReport {
  // Parse urgent issues from JSON string or use empty array
  let urgentIssues: UrgentIssue[] = [];
  try {
    if (db.urgent && typeof db.urgent === 'string' && db.urgent.trim() !== '') {
      const trimmedUrgent = db.urgent.trim();
      
      // Check if it looks like a JSON array (starts with [ and ends with ])
      if (trimmedUrgent.startsWith('[') && trimmedUrgent.endsWith(']')) {
        try {
          urgentIssues = JSON.parse(trimmedUrgent);
          
          // Ensure each issue has the required properties for the new structure
          urgentIssues = urgentIssues.map(issue => ({
            id: issue.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            description: issue.description || '',
            timestamp: issue.timestamp ? new Date(issue.timestamp) : new Date(),
            requiresAction: issue.requiresAction || false,
            isCompleted: issue.isCompleted === true,
            completedAt: (issue.completedAt && !isNaN(new Date(issue.completedAt).getTime())) ? new Date(issue.completedAt) : undefined,
            completedBy: issue.completedBy || undefined,
            submittedBy: issue.submittedBy || 'Unknown'
          }));
        } catch (jsonError) {
          console.warn('Failed to parse JSON array for urgent issues, treating as legacy text:', jsonError);
          // Fall back to legacy text format
          urgentIssues = [{
            id: Date.now().toString(),
            description: trimmedUrgent,
            timestamp: new Date(),
            requiresAction: false,
            isCompleted: false,
            submittedBy: db.submitted_by || 'Unknown'
          }];
        }
      } else {
        // Handle legacy text format - convert to new structure
        urgentIssues = [{
          id: Date.now().toString(),
          description: trimmedUrgent,
          timestamp: new Date(),
          requiresAction: false,
          isCompleted: false,
          submittedBy: db.submitted_by || 'Unknown'
        }];
      }
    }
  } catch (e) {
    console.warn('Unexpected error processing urgent issues:', e);
    // If there's any unexpected error but there's text content, treat as legacy format
    if (db.urgent && typeof db.urgent === 'string' && db.urgent.trim() !== '') {
      urgentIssues = [{
        id: Date.now().toString(),
        description: db.urgent.trim(),
        timestamp: new Date(),
        requiresAction: false,
        isCompleted: false,
        submittedBy: db.submitted_by || 'Unknown'
      }];
    } else {
      urgentIssues = [];
    }
  }

  return {
    id: String(db.id),
    businessUnit: db.business_unit,
    division: db.division,
    week: customWeekKeyFromDate(db.report_date), // "Wxx-YYYY" (from report date)
    isoYear: db.iso_year,  // These are actually custom week values now
    isoWeek: db.iso_week,  // These are actually custom week values now
    urgentIssues: urgentIssues,
    highlightOfWeek: db.highlight ?? '',
    businessDevelopment: db.biz_dev ?? '',
    plannedActivities: db.planned_next ?? '',
    submittedAt: new Date(), // Current date/time when report was actually submitted
    submittedBy: db.submitted_by ?? ''
  };
}

export function useWeeklyReports(selectedWeek?: string) {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { loading: authLoading, user } = useAuth();

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading || !user) return;
    
    (async () => {
      try {
        setLoading(true); setError(null);
        console.log('useWeeklyReports - selectedWeek:', selectedWeek);
        const rows = selectedWeek
          ? await getWeeklyReportsByWeek(selectedWeek)
          : await getWeeklyReports();
        console.log('useWeeklyReports - fetched rows:', rows.length);
        setReports(rows.map(convertToFrontendReport));
      } catch (e: any) {
        setError(e.message ?? 'Failed to load weekly reports');
        setReports([]);
      } finally { setLoading(false); }
    })();
  }, [selectedWeek, authLoading, user, refetchTrigger]);

  return { reports, loading, error, refetch };
}

export function useBusinessUnits() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await getBusinessUnits();
        setBusinessUnits(data.map(bu => ({ id: String(bu.id), name: bu.name, color: 'bg-blue-100 border-blue-200' })));
      } catch (e: any) {
        setError(e.message ?? 'Failed to load business units');
        setBusinessUnits([]);
      } finally { setLoading(false); }
    })();
  }, []);

  return { businessUnits, loading, error };
}

export function useDivisions() {
  const [divisions, setDivisions] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [bus, divs] = await Promise.all([getBusinessUnits(), getDivisions()]);
        setBusinessUnits(bus.map(bu => ({ id: String(bu.id), name: bu.name, color: 'bg-blue-100 border-blue-200' })));
        const grouped: Record<string, Array<{ id: string; name: string }>> = {};
        bus.forEach(bu => {
          grouped[bu.id.toString()] = divs
            .filter(d => d.business_unit_id === bu.id)
            .map(d => ({ id: d.id.toString(), name: d.name }));
        });
        setDivisions(grouped);
      } catch (e: any) {
        setDivisions({});
        setBusinessUnits([]);
        setError(e.message || 'Failed to load divisions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { divisions, businessUnits, loading, error };
}

export function useSubmitReport() {
  const { businessUnits } = useBusinessUnits();
  const { divisions } = useDivisions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (reportData: {
    businessUnitId: string;
    divisionId: string;
    weekDate: string;  // Monday date (YYYY-MM-DD)
    urgentIssues: UrgentIssue[];
    highlightOfWeek: string;
    businessDevelopment: string;
    plannedActivities: string;
    submittedBy: string;
  }) => {
    try {
      setLoading(true); setError(null);

      // Use Monday date directly to create ISO week key
      const weekKey = customWeekKeyFromDate(reportData.weekDate);
      
      // Resolve BU and Division names from IDs
      const businessUnit = businessUnits.find(bu => bu.id === reportData.businessUnitId);
      const allDivisions = Object.values(divisions).flat();
      const division = allDivisions.find(div => div.id === reportData.divisionId);
      
      if (!businessUnit) {
        throw new Error('Business unit not found');
      }
      if (!division) {
        throw new Error('Division not found');
      }

      await submitWeeklyReportViaRpc({
        business_unit: businessUnit.name,
        division: division.name,
        week: weekKey,
        urgent_issues: JSON.stringify(reportData.urgentIssues),
        highlight_of_week: reportData.highlightOfWeek,
        business_development: reportData.businessDevelopment,
        planned_activities: reportData.plannedActivities,
        submitted_by: reportData.submittedBy
      });

      return true;
    } catch (e: any) {
      const msg = e.message ?? 'Failed to submit report';
      setError(msg);
      throw e;
    } finally { setLoading(false); }
  };

  return { submitReport, loading, error };
}

export function useReportData(businessUnitId: string, divisionId: string, weekDate: string) {
  const { businessUnits } = useBusinessUnits();
  const { divisions } = useDivisions();
  const [reportData, setReportData] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      // Only fetch if we have all required data
      if (!businessUnitId || !divisionId || !weekDate || businessUnits.length === 0 || Object.keys(divisions).length === 0) {
        setReportData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Resolve business unit and division names
        const businessUnit = businessUnits.find(bu => bu.id === businessUnitId);
        const allDivisions = Object.values(divisions).flat();
        const division = allDivisions.find(div => div.id === divisionId);

        if (!businessUnit || !division) {
          setReportData(null);
          return;
        }

        // Use Monday date directly to get ISO week
        const { customYear, customWeek } = parseWeekKeyToCustom(weekDate);
        console.log('Fetching report for:', { businessUnit: businessUnit.name, division: division.name, customYear, customWeek, weekDate });

        // Fetch existing report
        const existingReport = await getSingleWeeklyReport(
          customYear,
          customWeek,
          businessUnit.name,
          division.name
        );

        console.log('Existing report found:', existingReport);
        if (existingReport) {
          setReportData(convertToFrontendReport(existingReport));
        } else {
          setReportData(null);
        }
      } catch (e: any) {
        console.error('Error fetching existing report:', e);
        setError(e.message ?? 'Failed to load existing report');
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [businessUnitId, divisionId, weekDate, businessUnits, divisions]);

  return { reportData, loading, error };
}