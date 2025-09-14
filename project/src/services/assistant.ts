import { supabase } from '../lib/supabase';

export interface AssistantResponse {
  answer: string;
  hits: Array<{
    id: number;
    business_unit: string;
    division: string;
    report_date: string;
    snippet: string;
  }>;
}

export async function askReportsAssistant(query: string): Promise<AssistantResponse> {
  // Runtime guard for Supabase URL
  if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL is missing from environment variables. Edge Function calls will fail.');
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  // Build absolute URL
  const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-answer`;

  // Get JWT token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw new Error(`Authentication error: ${sessionError.message}`);
  }

  const token = session?.access_token;
  
  if (!token) {
    console.warn('No JWT token found. Edge Function may return limited results due to RLS policies.');
  }

  try {
    const response = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      let errorMessage;
      try {
        errorMessage = await response.text();
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage || `Edge Function call failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data.answer !== 'string') {
      throw new Error('Invalid response format from Edge Function');
    }

    return {
      answer: data.answer,
      hits: Array.isArray(data.hits) ? data.hits : []
    };
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
}