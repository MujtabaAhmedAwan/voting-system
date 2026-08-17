import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// We use the service_role key to bypass Row Level Security (RLS) 
// since our API routes are acting as the trusted backend.
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function getStatus(email) {
  if (!supabase) {
    console.error('Supabase is not configured. Missing ENV variables.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_status')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is the code for "0 rows found" which is normal if user is new
        console.error('Error reading from Supabase:', error);
      }
      return null;
    }
    
    if (data) {
      return {
        status: data.status,
        accessToken: data.access_token
      };
    }
    return null;
  } catch (e) {
    console.error('Exception reading from Supabase:', e);
    return null;
  }
}

export async function setStatus(email, statusData) {
  if (!supabase) {
    console.error('Supabase is not configured. Missing ENV variables.');
    return;
  }

  try {
    const { error } = await supabase
      .from('user_status')
      .upsert({ 
        email: email, 
        status: statusData.status, 
        access_token: statusData.accessToken || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (error) {
      console.error('Error writing to Supabase:', error);
    }
  } catch (e) {
    console.error('Exception writing to Supabase:', e);
  }
}
