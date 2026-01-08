
import { Produto, Venda, LancamentoFinanceiro, EstatisticasUsuario, ConfiguracoesApp, Missao, Skill } from '../types';

const CHAVES = {
  PRODUTOS: 'dropos_v9_prod',
  VENDAS: 'dropos_v9_vend',
  FINAN: 'dropos_v9_fin',
  ESTATS: 'dropos_v9_stat',
  CONFIG: 'dropos_v9_conf',
  MISSOES: 'dropos_v9_miss'
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const storage = {
  configuracoes: {
    obter: (): ConfiguracoesApp => JSON.parse(localStorage.getItem(CHAVES.CONFIG) || 'null') || {
      modoVisual: 'normal', modoGhost: false, mostrarXP: true, tema: 'dark',
      codename: 'Operador Alfa', storeName: 'Minha Loja Drop',
      metas: { mensal: 0, diaria: 0 },
      financeiro: { regime: 'MEI', aliquotaImposto: 0, valorDasMensal: 72, reservaEmergencia: 0, porcentagemSocio: 0, porcentagemFuncionario: 5 },
      pomodoroTime: 25
    },
    salvar: (conf: ConfiguracoesApp) => { 
      localStorage.setItem(CHAVES.CONFIG, JSON.stringify(conf)); 
      window.dispatchEvent(new Event('storage-update')); 
    }
  },

  vendas: {
    obterTodas: (): Venda[] => JSON.parse(localStorage.getItem(CHAVES.VENDAS) || '[]'),
    salvar: (v: Partial<Venda>) => {
      const config = storage.configuracoes.obter();
      const todas = storage.vendas.obterTodas();
      
      // Cálculo de Comissão de Funcionário Automática
      const comissao = ((v.lucro_real || 0) * config.financeiro.porcentagemFuncionario) / 100;
      const novaVenda = { ...v, id: generateId(), comissao_paga: comissao } as Venda;
      
      const novos = [...todas, novaVenda];
      localStorage.setItem(CHAVES.VENDAS, JSON.stringify(novos));
      
      // Sincronização com Financeiro
      storage.financeiro.salvar({
        descricao: `Receita Venda: ${novaVenda.produto_nome}`,
        valor: novaVenda.valor_liquido_recebido,
        tipo: 'Receita',
        categoria: 'Vendas',
        status: 'Pago',
        data: novaVenda.data_venda
      });

      storage.usuario.adicionarExp(100);
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todas = storage.vendas.obterTodas().filter(v => v.id !== id);
      localStorage.setItem(CHAVES.VENDAS, JSON.stringify(todas));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  financeiro: {
    obterTodos: (): LancamentoFinanceiro[] => JSON.parse(localStorage.getItem(CHAVES.FINAN) || '[]'),
    salvar: (l: Partial<LancamentoFinanceiro>) => {
      const todos = storage.financeiro.obterTodos();
      const novos = [...todos, { ...l, id: generateId(), data: l.data || new Date().toISOString() } as LancamentoFinanceiro];
      localStorage.setItem(CHAVES.FINAN, JSON.stringify(novos));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todos = storage.financeiro.obterTodos().filter(f => f.id !== id);
      localStorage.setItem(CHAVES.FINAN, JSON.stringify(todos));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  produtos: {
    obterTodos: (): Produto[] => JSON.parse(localStorage.getItem(CHAVES.PRODUTOS) || '[]'),
    salvar: (p: Partial<Produto>) => {
      const todos = storage.produtos.obterTodos();
      const novos = p.id ? todos.map(item => item.id === p.id ? { ...item, ...p } : item) : [...todos, { ...p, id: generateId() } as Produto];
      localStorage.setItem(CHAVES.PRODUTOS, JSON.stringify(novos));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todos = storage.produtos.obterTodos().filter(p => p.id !== id);
      localStorage.setItem(CHAVES.PRODUTOS, JSON.stringify(todos));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  usuario: {
    obterEstats: (): EstatisticasUsuario => JSON.parse(localStorage.getItem(CHAVES.ESTATS) || 'null') || {
      nivel: 1, experiencia: 0, proxNivelExp: 1000, patente: 'Recruta', sequencia: 0, conquistas: [], skills: [], health_score: 100
    },
    adicionarExp: (exp: number) => {
      const stats = storage.usuario.obterEstats();
      stats.experiencia += exp;
      if (stats.experiencia >= stats.proxNivelExp) {
        stats.nivel++;
        stats.proxNivelExp *= 1.8;
        window.dispatchEvent(new CustomEvent('trigger-celebration', { detail: { type: 'subiu-nivel' } }));
      }
      localStorage.setItem(CHAVES.ESTATS, JSON.stringify(stats));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  missoes: {
    obterTodas: (): Missao[] => JSON.parse(localStorage.getItem(CHAVES.MISSOES) || '[]'),
    salvar: (m: Partial<Missao>) => {
      const todas = storage.missoes.obterTodas();
      const novas = [...todas, { ...m, id: generateId(), completa: false } as Missao];
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify(novas));
      window.dispatchEvent(new Event('storage-update'));
    },
    concluir: (id: string) => {
      const todas = storage.missoes.obterTodas();
      const novas = todas.map(m => {
        if (m.id === id && !m.completa) {
          storage.usuario.adicionarExp(m.recompensa);
          return { ...m, completa: true, progresso: m.objetivo };
        }
        return m;
      });
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify(novas));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todas = storage.missoes.obterTodas().filter(m => m.id !== id);
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify(todas));
      window.dispatchEvent(new Event('storage-update'));
    }
  }
};

export const notificar = (msg: string) => {
  const container = document.getElementById('toasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = "p-4 mb-2 bg-[var(--bg-card)] border-l-4 border-[var(--nu-purple)] text-white text-[10px] font-bold uppercase tracking-widest shadow-2xl";
  t.innerText = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
};
