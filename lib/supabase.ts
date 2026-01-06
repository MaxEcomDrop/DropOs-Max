
import { createClient } from '@supabase/supabase-js';

// Busca as chaves das variáveis de ambiente. 
// Nota: Em ambientes de produção, essas chaves devem ser configuradas corretamente.
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

// Inicialização segura com fallback para evitar erros de 'reading from of null'
// O cliente só é instanciado se as credenciais existirem.
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Helper para tratamento de erros do Supabase.
 * Retorna true se houver erro ou se o Supabase não estiver configurado.
 */
export const handleSupabaseError = (error: any) => {
  if (!supabase) {
    console.warn('Atenção: Conexão com Supabase não detectada. Verifique SUPABASE_URL e SUPABASE_ANON_KEY.');
    return true;
  }
  if (error) {
    console.error('Supabase Error:', error.message);
    // Erros de "Load failed" costumam ser rede/CORS ou chaves inválidas
    if (error.message === 'Load failed') {
      console.error('Falha de conexão: Verifique se a URL do Supabase está correta e acessível.');
    }
    return true;
  }
  return false;
};
