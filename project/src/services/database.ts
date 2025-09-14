import { supabase } from '../lib/supabase';
import { parseWeekKeyToCustom, customYearWeek } from '../utils/week-mapping';

// Environment check
const assertEnv = () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase env variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};
assertEnv();

export interface DatabaseBusinessUnit { id: number; name: string; }
export interface DatabaseDivision { id: number; business_unit_id: number; name: string; }

export interface WeeklyReportWithDetails {
  id: number;
  report_date: string;
  iso_year: number;
  iso_week: number;
  business_unit: string;
  division: string;
  submitted_by: string | null;
  urgent: string | null;
  highlight: string | null;
  biz_dev: string | null;
  planned_next: string | null;
}

// ---- Business Units / Divisions ----
export async function getBusinessUnits(): Promise<DatabaseBusinessUnit[]> {
  const { data, error } = await supabase.from('business_units').select('id,name').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getDivisions(): Promise<DatabaseDivision[]> {
  const { data, error } = await supabase.from('divisions').select('id,name,business_unit_id').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getDivisionsByBusinessUnit(businessUnitId: number): Promise<DatabaseDivision[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('id,name,business_unit_id')
    .eq('business_unit_id', businessUnitId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

// ---- Weekly Reports (READ) ----
export async function getWeeklyReports() {
  try {
    const { data, error } = await supabase
      .from('bolt_weekly_reports_view')
      .select('*')
      .order('report_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as WeeklyReportWithDetails[];
  } catch (e: any) {
    if (e?.message === 'Failed to fetch') {
      console.error('Network error (Failed to fetch). Possible causes: malformed order param, missing env vars, blocked by adblock/VPN, offline.');
    }
    throw e;
  }
}

export async function getWeeklyReportsByWeek(weekKey: string): Promise<WeeklyReportWithDetails[]> {
  try {
    // Parse the weekKey to get custom week info
    let customYear: number, customWeek: number;
    
    if (weekKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // It's a date string (Sunday date)
      const sundayDate = new Date(weekKey + 'T00:00:00Z');
      const weekInfo = customYearWeek(sundayDate);
      customYear = weekInfo.year;
      customWeek = weekInfo.week;
    } else {
      // It's a week key like "W35-2025"
      const parsed = parseWeekKeyToCustom(weekKey);
      customYear = parsed.customYear;
      customWeek = parsed.customWeek;
    }
    
    console.log('getWeeklyReportsByWeek - Input weekKey:', weekKey);
    console.log('getWeeklyReportsByWeek - Calculated custom week:', { customYear, customWeek });
    
    console.log('getWeeklyReportsByWeek - Querying database with:', { 
      iso_year: customYear, 
      iso_week: customWeek,
      originalWeekKey: weekKey 
    });
    
    // Guard against invalid week parsing
    if (!Number.isFinite(customYear) || !Number.isFinite(customWeek)) {
      throw new Error(`Invalid week selection: ${weekKey}`);
    }
    
    const { data, error } = await supabase
      .from('bolt_weekly_reports_view')
      .select('*')
      .eq('iso_year', customYear)  // Note: Database still uses 'iso_year' and 'iso_week' columns
      .eq('iso_week', customWeek)   // but now we're passing custom week values
      .order('report_date', { ascending: false });
    if (error) throw error;
    
    console.log('getWeeklyReportsByWeek - Query result count:', data?.length || 0);
    console.log('getWeeklyReportsByWeek - Sample data from database:', data?.slice(0, 2)?.map(d => ({
      id: d.id,
      business_unit: d.business_unit,
      division: d.division,
      report_date: d.report_date,
      iso_year: d.iso_year,
      iso_week: d.iso_week
    })));
    return (data ?? []) as WeeklyReportWithDetails[];
  } catch (e: any) {
    if (e?.message === 'Failed to fetch') {
      console.error('Network error (Failed to fetch). Possible causes: malformed order param, missing env vars, blocked by adblock/VPN, offline.');
    }
    throw e;
  }
}

// WRITE: do NOT send iso_year/iso_week; DB trigger fills them.
export async function submitWeeklyReport(report: {
  report_date: string;        // "YYYY-MM-DD"
  submitted_by: string;
  business_unit_id: number;
  division_id: number;
  urgent: string;
  highlight: string;
  biz_dev: string;
  planned_next: string;
}) {
  const { data, error } = await supabase
    .from('weekly_reports')
    .insert([report])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitWeeklyReportViaRpc(input: {
  business_unit: string;
  division: string;
  week: string; // "W43-2025" or "YYYY-MM-DD"
  urgent_issues: string; // JSON string of UrgentIssue[]
  highlight_of_week: string;
  business_development: string;
  planned_activities: string;
  submitted_by: string;
}) {
  console.log('submitWeeklyReportViaRpc - Input urgent_issues:', input.urgent_issues);
  const { data, error } = await supabase.rpc('bolt_submit_weekly_report', input);
  if (error) throw error;
  return data as number;
}

export async function getSingleWeeklyReport(
  isoYear: number,
  isoWeek: number,
  businessUnitName: string,
  divisionName: string
): Promise<WeeklyReportWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('bolt_weekly_reports_view')
      .select('*')
      .eq('iso_year', isoYear)
      .eq('iso_week', isoWeek)
      .eq('business_unit', businessUnitName)
      .eq('division', divisionName)
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // Return null if no report found, otherwise return the first result
    return data.length === 0 ? null : (data[0] as WeeklyReportWithDetails);
  } catch (e: any) {
    if (e?.message === 'Failed to fetch') {
      console.error('Network error (Failed to fetch). Possible causes: malformed params, missing env vars, blocked by adblock/VPN, offline.');
    }
    throw e;
  }
}