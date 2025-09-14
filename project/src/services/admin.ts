import { supabase } from '../lib/supabase';

export interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'BU_MANAGER' | 'DIVISION_MANAGER';
  business_unit_id: number | null;
  business_unit_name: string | null;
  created_at: string;
}

export interface BusinessUnit {
  id: number;
  name: string;
}

export async function fetchAdminProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('admin_profiles_view')
    .select('*')
    .order('email');
  
  if (error) throw error;
  return data || [];
}

export async function fetchBusinessUnits(): Promise<BusinessUnit[]> {
  const { data, error } = await supabase
    .from('business_units')
    .select('id, name')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function adminUpdateProfile({
  user_id,
  role,
  business_unit_name
}: {
  user_id: string;
  role: 'BU_MANAGER' | 'DIVISION_MANAGER';
  business_unit_name?: string | null;
}) {
  const { data, error } = await supabase.rpc('admin_update_profile', {
    p_user_id: user_id,
    p_role: role,
    p_business_unit_name: business_unit_name || null
  });
  
  if (error) throw error;
  return data;
}