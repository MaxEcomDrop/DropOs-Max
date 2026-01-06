
export type StockType = 'Físico' | 'Virtual';
export type Channel = 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Balcão';
export type CNPJ = 'Loja A' | 'Loja B';
export type TransactionType = 'Entrada' | 'Saída';
export type FinanceCategory = 'Pró-labore' | 'Luz' | 'Internet' | 'Fornecedor' | 'Venda Avulsa' | 'Outros';

export interface Supplier {
  id: string;
  nome_empresa: string;
  contato_whatsapp: string;
  saldo_haver: number;
  prazo_entrega: number;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  nome: string;
  estoque_tipo: StockType;
  fornecedor_id: string;
  custo: number;
  preco_venda: number;
  quantidade: number;
  min_estoque: number;
  last_sold_at?: string;
  created_at?: string;
}

export interface FinancialEntry {
  id: string;
  descricao: string;
  tipo: TransactionType;
  valor: number;
  data_vencimento: string;
  status: 'Pago' | 'Pendente';
  created_at?: string;
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
}
