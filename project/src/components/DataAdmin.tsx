import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

interface DataAdminProps {
  isDarkMode: boolean;
}

interface DealRow {
  'Opportunity Owner': string;
  'Created Date': string;
  'Opportunity Name': string;
  'Account Name': string;
  'Business Unit': string;
  'Division': string;
  'Deal Value': number;
  'Gross Margin %': number;
  'Gross Margin Value': number;
  'Probability (%)': number;
  'Forecast Level': string;
  'Stage': string;
  'Forecast Year': string;
  'Close Date': string;
}

export function DataAdmin({ isDarkMode }: DataAdminProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadMode, setUploadMode] = useState<'add' | 'replace'>('add');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [existingRecordCount, setExistingRecordCount] = useState<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (uploadMode === 'replace') {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setExistingRecordCount(count);
      }

      setPendingFile(file);
      setShowConfirmDialog(true);
      event.target.value = '';
    } else {
      await processFileUpload(file);
      event.target.value = '';
    }
  };

  const processFileUpload = async (file: File) => {
    setUploading(true);
    setUploadStatus('idle');
    setMessage('');
    setUploadedCount(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        throw new Error('The Excel file is empty');
      }

      const deals = jsonData.map((row: any) => {
        const dealValue = row['Deal Value'];
        const grossMarginPercent = row['Gross Margin %'];
        const grossMarginValue = row['Gross Margin Value'];
        const probability = row['Probability (%)'];

        return {
          'Opportunity Owner': row['Opportunity Owner'] || '',
          'Created Date': row['Created Date'] ? parseExcelDate(row['Created Date']) : null,
          'Opportunity Name': row['Opportunity Name'] || '',
          'Account Name': row['Account Name'] || '',
          'Business Unit': row['Business Unit'] || '',
          'Division': row['Division'] || '',
          'Deal Value': typeof dealValue === 'string'
            ? parseFloat(dealValue.replace(/[^0-9.-]/g, ''))
            : parseFloat(dealValue) || 0,
          'Gross Margin %': typeof grossMarginPercent === 'string'
            ? parseFloat(grossMarginPercent.replace(/[^0-9.-]/g, ''))
            : parseFloat(grossMarginPercent) || 0,
          'Gross Margin Value': typeof grossMarginValue === 'string'
            ? parseFloat(grossMarginValue.replace(/[^0-9.-]/g, ''))
            : parseFloat(grossMarginValue) || 0,
          'Probability (%)': typeof probability === 'string'
            ? parseFloat(probability.replace(/[^0-9.-]/g, ''))
            : parseFloat(probability) || 0,
          'Forecast Level': row['Forecast Level'] || '',
          'Stage': row['Stage'] || '',
          'Forecast Year': row['Forecast Year'] ? String(row['Forecast Year']) : '',
          'Close Date': row['Close Date'] ? parseExcelDate(row['Close Date']) : null,
        };
      });

      if (uploadMode === 'replace') {
        const { error: deleteError } = await supabase
          .from('deals')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
          throw new Error(`Failed to delete existing data: ${deleteError.message}`);
        }
      }

      const { data: insertedData, error } = await supabase
        .from('deals')
        .insert(deals);

      if (error) {
        throw error;
      }

      setUploadedCount(deals.length);
      setUploadStatus('success');
      setMessage(
        uploadMode === 'replace'
          ? `Successfully replaced all data. ${deals.length} deals uploaded.`
          : `Successfully uploaded ${deals.length} deals to the database.`
      );
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      setMessage(error.message || 'Failed to upload the file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmReplace = async () => {
    setShowConfirmDialog(false);
    if (pendingFile) {
      await processFileUpload(pendingFile);
      setPendingFile(null);
    }
  };

  const handleCancelReplace = () => {
    setShowConfirmDialog(false);
    setPendingFile(null);
  };

  const parseExcelDate = (excelDate: any): string | null => {
    if (!excelDate) return null;

    if (typeof excelDate === 'string') {
      return excelDate;
    }

    if (typeof excelDate === 'number') {
      const date = XLSX.SSF.parse_date_code(excelDate);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }

    return null;
  };

  return (
    <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
    }`}>
      <div className={`px-6 py-5 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
          }`}>
            <FileSpreadsheet className={`w-5 h-5 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Data Admin
            </h2>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Import deals data from Excel files
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className={`mb-6 p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
        }`}>
          <h3 className={`font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Upload Mode:
          </h3>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="uploadMode"
                value="add"
                checked={uploadMode === 'add'}
                onChange={(e) => setUploadMode(e.target.value as 'add' | 'replace')}
                className="mr-2"
              />
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                Add Data (keep existing records)
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="uploadMode"
                value="replace"
                checked={uploadMode === 'replace'}
                onChange={(e) => setUploadMode(e.target.value as 'add' | 'replace')}
                className="mr-2"
              />
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                Replace All Data (delete all existing records)
              </span>
            </label>
          </div>
        </div>

        <div className={`mb-6 p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Required Excel Columns (14 total):
          </h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-sm ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <div>• Opportunity Owner</div>
            <div>• Created Date</div>
            <div>• Opportunity Name</div>
            <div>• Account Name</div>
            <div>• Business Unit</div>
            <div>• Division</div>
            <div>• Deal Value</div>
            <div>• Gross Margin %</div>
            <div>• Gross Margin Value</div>
            <div>• Probability (%)</div>
            <div>• Forecast Level</div>
            <div>• Stage</div>
            <div>• Forecast Year</div>
            <div>• Close Date</div>
          </div>
        </div>

        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${
          isDarkMode
            ? 'border-slate-600 hover:border-red-500/50 hover:bg-slate-700/30'
            : 'border-slate-300 hover:border-red-400 hover:bg-red-50/50'
        }`}>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <p className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {uploading ? 'Uploading...' : 'Click to upload Excel file'}
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Supports .xlsx and .xls files
            </p>
          </label>
        </div>

        {uploadStatus !== 'idle' && (
          <div className={`mt-6 p-4 rounded-xl border ${
            uploadStatus === 'success'
              ? isDarkMode
                ? 'bg-green-900/20 border-green-800 text-green-300'
                : 'bg-green-50 border-green-200 text-green-800'
              : isDarkMode
                ? 'bg-red-900/20 border-red-800 text-red-300'
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {uploadStatus === 'success' ? 'Upload Successful' : 'Upload Failed'}
                </p>
                <p className="text-sm mt-1">{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-6 p-4 rounded-xl border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className={`text-sm ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure your Excel file has the exact column headers listed above</li>
                <li>Date fields should be in a valid date format</li>
                <li>Numeric fields (Deal Value, Gross Margin, etc.) should contain numbers only</li>
                {uploadMode === 'add' && <li>New data will be added to existing records</li>}
                {uploadMode === 'replace' && (
                  <li className="font-bold text-red-500">
                    WARNING: All existing data will be permanently deleted before uploading new data
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-2xl shadow-2xl ${
            isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className={`px-6 py-5 border-b ${
              isDarkMode ? 'border-slate-700 bg-red-900/20' : 'border-slate-200 bg-red-50'
            }`}>
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                Confirm Data Replacement
              </h3>
            </div>
            <div className="p-6">
              <div className={`p-4 rounded-lg border mb-4 ${
                isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <p className={`font-semibold mb-2 ${
                  isDarkMode ? 'text-red-300' : 'text-red-800'
                }`}>
                  WARNING: This action cannot be undone!
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-red-200' : 'text-red-700'
                }`}>
                  You are about to permanently delete all existing deal data from the database.
                </p>
              </div>
              <div className={`p-4 rounded-lg border mb-6 ${
                isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <p className="mb-2">
                    <span className="font-semibold">Existing records:</span> {existingRecordCount}
                  </p>
                  <p>
                    <span className="font-semibold">Action:</span> All records will be deleted and replaced with new data from the uploaded file
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelReplace}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReplace}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Confirm Delete & Replace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
