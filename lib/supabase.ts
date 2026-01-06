
import { createClient } from '@supabase/supabase-js';

// Tenta obter de múltiplas fontes comuns para evitar erros de ambiente
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseKey = (window as any).process?.env?.SUPABASE_ANON_KEY || (window as any).process?.env?.SUPABASE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const handleSupabaseError = (error: any) => {
  if (!supabase) {
    console.error('ERRO: Supabase não está inicializado. Verifique as chaves SUPABASE_URL e SUPABASE_ANON_KEY.');
    alert('Erro de conexão: Chaves do banco não encontradas.');
    return true;
  }
  if (error) {
    console.error('Erro de Operação no Banco:', error.message, error);
    alert(`Erro no Supabase: ${error.message}\nVerifique se os nomes das colunas e tabelas batem com o SQL.`);
    return true;
  }
  return false;
};
