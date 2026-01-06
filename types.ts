
export type StockType = 'Físico' | 'Virtual';
export type Channel = 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Balcão';
export type CNPJ = 'Loja A' | 'Loja B';
export type TransactionType = 'Entrada' | 'Saída';
export type FinanceCategory = 'Pró-labore' | 'Luz' | 'Internet' | 'Fornecedor' | 'Venda Avulsa' | 'Outros';

export interface Supplier {
  id: string;
  nome: string;
  contato: string;
  prazo_entrega: number;
  saldo_haver: number;
  atraso_medio?: number; // Em dias
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  nome: string;
  fornecedor_id: string;
  custo: number;
  preco_venda: number;
  estoque_tipo: StockType;
  quantidade: number;
  min_estoque: number;
  last_sold_at?: string;
  created_at?: string;
  custo_historico?: number;
}

export interface Sale {
  id: string;
  data: string;
  canal: Channel;
  cnpj: CNPJ;
  product_id: string;
  quantidade: number;
  valor_bruto: number;
  valor_liquido: number;
  is_servico: boolean;
  is_devolucao: boolean;
  margem_real?: number;
}

export interface FinancialEntry {
  id: string;
  descricao: string;
  tipo: TransactionType;
  categoria: FinanceCategory;
  status: 'Pago' | 'Pendente';
  valor: number;
  data: string;
  is_pessoal?: boolean;
  created_at?: string;
}
