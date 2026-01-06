
export type StockType = 'Físico' | 'Virtual';
export type Channel = 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Balcão';
export type TransactionType = 'Entrada' | 'Saída';

export interface Supplier {
  id?: string;
  nome: string;
  contato: string;
  saldo_haver: number;
}

export interface Product {
  id?: string;
  sku: string;
  nome: string;
  tipo: StockType;
  fornecedor: string; // Nome do fornecedor
  custo: number;
  preco_venda: number;
}

export interface FinancialEntry {
  id?: string;
  descricao: string;
  tipo: TransactionType;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente';
}

export interface Sale {
  id?: string;
  data_venda: string;
  canal: Channel;
  loja: string;
  produto: string; // Nome do produto
  qtd: number;
  valor_bruto: number;
  valor_liquido: number;
  custo_produto: number;
  lucro_real: number;
}
