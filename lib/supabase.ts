
import { createClient } from '@supabase/supabase-js';

// Prioriza variáveis de ambiente. Se não existirem, o app entra em modo visual seguro.
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const handleSupabaseError = (error: any) => {
  if (!supabase) {
    console.warn('Configuração do Supabase ausente. Operações de salvamento não funcionarão.');
    return true;
  }
  if (error) {
    console.error('Supabase Error:', error.message);
    alert(`ERRO NO BANCO: ${error.message}`);
    return true;
  }
  return false;
};
