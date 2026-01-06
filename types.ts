
export type StockType = 'Físico' | 'Virtual';
export type Channel = 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Balcão';
export type CNPJ = 'Loja A' | 'Loja B';
export type TransactionType = 'Entrada' | 'Saída';

export interface Supplier {
  id: string;
  nome: string; // Mapeado de nome_empresa
  contato: string; // Mapeado de contato_whatsapp
  saldo_haver: number;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  nome: string;
  tipo: StockType; // Mapeado de estoque_tipo
  fornecedor: string; // Mapeado de fornecedor_id
  custo: number;
  preco_venda: number;
  quantidade?: number; // Adicionado para controle local, embora não citado no prompt de schema
  created_at?: string;
}

export interface FinancialEntry {
  id: string;
  descricao: string;
  tipo: TransactionType;
  valor: number;
  vencimento: string; // Mapeado de data_vencimento
  status: 'Pago' | 'Pendente';
  created_at?: string;
}

export interface Sale {
  id: string;
  data_venda: string; // Mapeado de data
  canal: Channel;
  loja: string; // Mapeado de cnpj
  produto: string; // Mapeado de product_id (nome ou id do produto)
  qtd: number; // Mapeado de quantidade
  valor_bruto: number;
  valor_liquido: number;
  custo_produto: number; // Novo campo obrigatório
  lucro_real: number; // Novo campo obrigatório
}
