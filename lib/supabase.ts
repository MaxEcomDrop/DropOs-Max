
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const handleSupabaseError = (error: any) => {
  if (!supabase) {
    console.warn('Conexão Supabase não detectada.');
    return true;
  }
  if (error) {
    console.error('Erro de Operação:', error.message);
    alert(`Erro no Banco: ${error.message}`);
    return true;
  }
  return false;
};
