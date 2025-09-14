import React, { useState, useEffect } from 'react';
import { fetchAdminProfiles, fetchBusinessUnits, adminUpdateProfile, type AdminProfile, type BusinessUnit } from '../services/admin';
import { Users, Search, Shield, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AdminUsersProps {
  isDarkMode: boolean;
}

export function AdminUsers({ isDarkMode }: AdminUsersProps) {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesData, businessUnitsData] = await Promise.all([
        fetchAdminProfiles(),
        fetchBusinessUnits()
      ]);
      setProfiles(profilesData);
      setBusinessUnits(businessUnitsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'BU_MANAGER' | 'DIVISION_MANAGER') => {
    try {
      setSavingUserId(userId);
      
      // If changing to BU_MANAGER, clear business unit
      const businessUnitName = newRole === 'BU_MANAGER' ? null : 
        profiles.find(p => p.user_id === userId)?.business_unit_name;

      await adminUpdateProfile({
        user_id: userId,
        role: newRole,
        business_unit_name: businessUnitName
      });

      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.user_id === userId 
          ? { 
              ...profile, 
              role: newRole,
              business_unit_id: newRole === 'BU_MANAGER' ? null : profile.business_unit_id,
              business_unit_name: newRole === 'BU_MANAGER' ? null : profile.business_unit_name
            }
          : profile
      ));

      setMessage({ type: 'success', text: 'User role updated successfully' });
    } catch (error) {
      console.error('Failed to update role:', error);
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setSavingUserId(null);
    }
  };

  const handleBusinessUnitChange = async (userId: string, businessUnitName: string) => {
    try {
      setSavingUserId(userId);
      
      await adminUpdateProfile({
        user_id: userId,
        role: 'DIVISION_MANAGER',
        business_unit_name: businessUnitName
      });

      // Update local state
      const selectedBU = businessUnits.find(bu => bu.name === businessUnitName);
      setProfiles(prev => prev.map(profile => 
        profile.user_id === userId 
          ? { 
              ...profile, 
              role: 'DIVISION_MANAGER',
              business_unit_id: selectedBU?.id || null,
              business_unit_name: businessUnitName
            }
          : profile
      ));

      setMessage({ type: 'success', text: 'Business unit updated successfully' });
    } catch (error) {
      console.error('Failed to update business unit:', error);
      setMessage({ type: 'error', text: 'Failed to update business unit' });
    } finally {
      setSavingUserId(null);
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (profile.business_unit_name && profile.business_unit_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
          <div className="animate-pulse">
            <div className={`h-8 rounded mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 rounded mb-6 w-2/3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-16 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                User Management
              </h1>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Manage user roles and business unit assignments
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search by name, email, or business unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' 
                : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center space-x-3 ${
          message.type === 'success' 
            ? isDarkMode 
              ? 'bg-emerald-900/20 border border-emerald-800/50' 
              : 'bg-emerald-50 border border-emerald-200'
            : isDarkMode
              ? 'bg-red-900/20 border border-red-800/50'
              : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          )}
          <span className={`font-medium ${
            message.type === 'success'
              ? isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
              : isDarkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Users Table */}
      <div className={`rounded-2xl shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  User
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Business Unit
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
              {filteredProfiles.map((profile) => (
                <tr key={profile.user_id} className={`hover:${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} transition-colors`}>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {profile.full_name || 'No name'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {profile.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.user_id, e.target.value as 'BU_MANAGER' | 'DIVISION_MANAGER')}
                      disabled={savingUserId === profile.user_id}
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-white' 
                          : 'border-slate-300 bg-white text-slate-900'
                      } ${savingUserId === profile.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="BU_MANAGER">BU Manager</option>
                      <option value="DIVISION_MANAGER">Division Manager</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={profile.business_unit_name || ''}
                      onChange={(e) => handleBusinessUnitChange(profile.user_id, e.target.value)}
                      disabled={profile.role === 'BU_MANAGER' || savingUserId === profile.user_id}
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-white' 
                          : 'border-slate-300 bg-white text-slate-900'
                      } ${(profile.role === 'BU_MANAGER' || savingUserId === profile.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Business Unit</option>
                      {businessUnits.map((bu) => (
                        <option key={bu.id} value={bu.name}>
                          {bu.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {savingUserId === profile.user_id ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className={`w-4 h-4 animate-spin ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Saving...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${
                          profile.role === 'BU_MANAGER' 
                            ? isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                            : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          {profile.role === 'BU_MANAGER' ? (
                            <Shield className={`w-3 h-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          ) : (
                            <Building2 className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          profile.role === 'BU_MANAGER'
                            ? isDarkMode ? 'text-purple-300' : 'text-purple-700'
                            : isDarkMode ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Active
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              No users found
            </h3>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'No users available to manage.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}