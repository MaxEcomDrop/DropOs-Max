
export type CanalVenda = 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Site Próprio' | 'Instagram' | 'TikTok' | 'Facebook Ads' | 'Google Ads' | 'Taboola';
export type TipoTransacao = 'Receita' | 'Despesa' | 'Investimento';
export type CategoriaFinanceira = 'Vendas' | 'CMV' | 'Marketing' | 'Impostos' | 'Operacional' | 'Comissões' | 'Software' | 'Reserva' | 'Fixo' | 'Variável' | 'Outros';
export type FrequenciaMissao = 'Diária' | 'Semanal' | 'Mensal' | 'Livre';
export type RaridadeProduto = 'Comum' | 'Raro' | 'Épico' | 'Lendário';
export type RegimeTributario = 'MEI' | 'Simples Nacional' | 'CPF';
export type ModoVisual = 'normal' | 'rico' | 'milionario';
export type TemaSistema = 'dark' | 'light';
export type PrioridadeMissao = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Skill {
  id: string;
  nome: string;
  nivel: number;
}

export interface EstatisticasUsuario {
  nivel: number;
  experiencia: number;
  proxNivelExp: number;
  patente: string;
  sequencia: number;
  conquistas: string[];
  skills: Skill[];
  health_score: number;
}

export interface Missao {
  id: string;
  titulo: string;
  recompensa: number;
  progresso: number;
  objetivo: number;
  frequencia: FrequenciaMissao;
  completa: boolean;
  categoria: string;
  prioridade: PrioridadeMissao;
  data_alvo: string;
}

export interface LancamentoFinanceiro {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: CategoriaFinanceira;
  data: string;
  status: 'Pendente' | 'Pago';
  is_fixo?: boolean;
  venda_id?: string;
}

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  custo_fornecedor: number;
  preco_venda_alvo: number;
  raridade: RaridadeProduto;
}

export interface Venda {
  id: string;
  data_venda: string;
  canal: CanalVenda;
  produto_nome: string;
  faturamento_bruto: number;
  valor_liquido_recebido: number;
  taxas_plataforma: number;
  custo_mercadoria_total: number;
  lucro_real: number;
  custo_ads: number;
  comissao_paga?: number;
  cliente: string;
  produto_id: string;
  quantidade: number;
  valor_venda_un: number;
  status: string;
}

export interface ConfiguracoesApp {
  modoVisual: ModoVisual;
  modoGhost: boolean;
  mostrarXP: boolean;
  tema: TemaSistema;
  codename: string;
  storeName: string;
  metas: { mensal: number; diaria: number };
  financeiro: {
    regime: RegimeTributario;
    aliquotaImposto: number;
    valorDasMensal: number;
    reservaEmergencia: number;
    porcentagemSocio: number;
    porcentagemFuncionario: number;
  };
  pomodoroTime: number;
}
