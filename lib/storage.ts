
import { Produto, Venda, LancamentoFinanceiro, EstatisticasUsuario, ConfiguracoesApp, Missao, PrioridadeMissao } from '../types';

const CHAVES = {
  PRODUTOS: 'dropos_v14_prod',
  VENDAS: 'dropos_v14_vend',
  FINAN: 'dropos_v14_fin',
  ESTATS: 'dropos_v14_stat',
  CONFIG: 'dropos_v14_conf',
  MISSOES: 'dropos_v14_miss',
  BACKUP: 'dropos_v14_master_backup'
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// Utilitário de leitura segura
const safeRead = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Erro Crítico na Leitura de ${key}:`, e);
    return defaultValue;
  }
};

// Sistema de Snapshot automático
const performSnapshot = () => {
  try {
    const data = {
      prod: localStorage.getItem(CHAVES.PRODUTOS),
      vend: localStorage.getItem(CHAVES.VENDAS),
      fin: localStorage.getItem(CHAVES.FINAN),
      stat: localStorage.getItem(CHAVES.ESTATS),
      conf: localStorage.getItem(CHAVES.CONFIG),
      miss: localStorage.getItem(CHAVES.MISSOES),
      ts: Date.now()
    };
    localStorage.setItem(CHAVES.BACKUP, JSON.stringify(data));
  } catch (e) {
    console.warn('Snapshot de segurança falhou (espaço insuficiente?)');
  }
};

export const storage = {
  configuracoes: {
    obter: (): ConfiguracoesApp => safeRead(CHAVES.CONFIG, {
      modoVisual: 'normal', modoGhost: false, mostrarXP: true, tema: 'dark',
      codename: 'Operador Alfa', storeName: 'Comando Drop',
      metas: { mensal: 0, diaria: 0 },
      financeiro: { regime: 'MEI', aliquotaImposto: 0, valorDasMensal: 72, reservaEmergencia: 0, porcentagemSocio: 0, porcentagemFuncionario: 5 },
      pomodoroTime: 25
    }),
    salvar: (conf: ConfiguracoesApp) => { 
      performSnapshot();
      localStorage.setItem(CHAVES.CONFIG, JSON.stringify(conf)); 
      window.dispatchEvent(new Event('storage-update')); 
    }
  },

  vendas: {
    obterTodas: (): Venda[] => safeRead(CHAVES.VENDAS, []),
    salvar: (v: Partial<Venda>) => {
      performSnapshot();
      const config = storage.configuracoes.obter();
      const todas = storage.vendas.obterTodas();
      
      const faturamento = Math.max(0, (v.valor_venda_un || 0) * (v.quantidade || 0));
      const recebido = Math.max(0, v.valor_liquido_recebido || 0);
      const taxas = Math.max(0, faturamento - recebido);
      const custoCMV = Math.max(0, v.custo_mercadoria_total || 0);
      const ads = Math.max(0, v.custo_ads || 0);
      
      const lucroOp = Math.max(0, recebido - custoCMV - ads);
      const comissao = (lucroOp * config.financeiro.porcentagemFuncionario) / 100;
      const lucroFinal = Math.max(0, lucroOp - comissao);
      
      const novaVenda = { 
        ...v, 
        id: generateId(), 
        faturamento_bruto: faturamento,
        taxas_plataforma: taxas,
        comissao_paga: comissao,
        lucro_real: lucroFinal 
      } as Venda;
      
      localStorage.setItem(CHAVES.VENDAS, JSON.stringify([...todas, novaVenda]));
      
      storage.financeiro.salvar({ 
        descricao: `Recebimento: ${novaVenda.produto_nome}`, 
        valor: recebido, 
        tipo: 'Receita', 
        categoria: 'Vendas', 
        status: 'Pago',
        venda_id: novaVenda.id,
        data: novaVenda.data_venda
      });

      storage.usuario.adicionarExp(Math.floor(Math.random() * 200) + 150);
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      performSnapshot();
      const todas = storage.vendas.obterTodas();
      localStorage.setItem(CHAVES.VENDAS, JSON.stringify(todas.filter(v => v.id !== id)));
      const financeiro = storage.financeiro.obterTodos().filter(f => f.venda_id !== id);
      localStorage.setItem(CHAVES.FINAN, JSON.stringify(financeiro));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  financeiro: {
    obterTodos: (): LancamentoFinanceiro[] => safeRead(CHAVES.FINAN, []),
    salvar: (l: Partial<LancamentoFinanceiro>) => {
      const todos = storage.financeiro.obterTodos();
      localStorage.setItem(CHAVES.FINAN, JSON.stringify([...todos, { ...l, id: generateId(), valor: Math.max(0, l.valor || 0) }]));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todos = storage.financeiro.obterTodos();
      localStorage.setItem(CHAVES.FINAN, JSON.stringify(todos.filter(f => f.id !== id)));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  produtos: {
    obterTodos: (): Produto[] => safeRead(CHAVES.PRODUTOS, []),
    salvar: (p: Partial<Produto>) => {
      const todos = storage.produtos.obterTodos();
      const novos = p.id ? todos.map(item => item.id === p.id ? { ...item, ...p } : item) : [...todos, { ...p, id: generateId() } as Produto];
      localStorage.setItem(CHAVES.PRODUTOS, JSON.stringify(novos));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      const todos = storage.produtos.obterTodos();
      localStorage.setItem(CHAVES.PRODUTOS, JSON.stringify(todos.filter(p => p.id !== id)));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  usuario: {
    obterEstats: (): EstatisticasUsuario => {
      const data = safeRead(CHAVES.ESTATS, null);
      if (!data) return { nivel: 1, experiencia: 0, proxNivelExp: 1000, patente: 'Recruta', sequencia: 0, conquistas: [], skills: [], health_score: 100 };
      
      let patente = 'Recruta';
      if (data.nivel > 50) patente = 'Lenda Viva';
      else if (data.nivel > 30) patente = 'Comandante';
      else if (data.nivel > 15) patente = 'Especialista';
      else if (data.nivel > 5) patente = 'Operador';
      
      return { ...data, patente };
    },
    adicionarExp: (exp: number) => {
      const stats = storage.usuario.obterEstats();
      stats.experiencia += exp;
      
      // Efeito visual instantâneo de XP subindo
      window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: exp } }));

      while (stats.experiencia >= stats.proxNivelExp) {
        stats.experiencia -= stats.proxNivelExp;
        stats.nivel++;
        stats.proxNivelExp = Math.floor(stats.proxNivelExp * 1.6);
        window.dispatchEvent(new CustomEvent('trigger-celebration', { detail: { type: 'subiu-nivel' } }));
      }
      localStorage.setItem(CHAVES.ESTATS, JSON.stringify(stats));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  missoes: {
    obterTodas: (): Missao[] => safeRead(CHAVES.MISSOES, []),
    salvar: (titulo: string, prioridade: PrioridadeMissao, data_alvo: string) => {
      const bases = { Baixa: 200, Média: 500, Alta: 1000, Crítica: 2500 };
      const recompensa = Math.floor(Math.random() * (bases[prioridade] * 0.3)) + bases[prioridade];
      const nova: Missao = { id: generateId(), titulo, prioridade, data_alvo, recompensa, progresso: 0, objetivo: 1, completa: false, frequencia: 'Livre', categoria: 'CEO' };
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify([...storage.missoes.obterTodas(), nova]));
      window.dispatchEvent(new Event('storage-update'));
    },
    concluir: (id: string) => {
      const novas = storage.missoes.obterTodas().map(m => {
        if (m.id === id && !m.completa) {
          storage.usuario.adicionarExp(m.recompensa);
          return { ...m, completa: true };
        }
        return m;
      });
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify(novas));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      localStorage.setItem(CHAVES.MISSOES, JSON.stringify(storage.missoes.obterTodas().filter(m => m.id !== id)));
      window.dispatchEvent(new Event('storage-update'));
    }
  }
};

export const notificar = (msg: string) => {
  const container = document.getElementById('toasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = "nu-card p-5 bg-[var(--bg-card)] border-l-8 border-[var(--nu-purple)] text-white text-[12px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-in slide-in-from-right";
  t.innerHTML = `<div class="w-2 h-2 rounded-full bg-[var(--nu-purple)] animate-pulse"></div> <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
    setTimeout(() => t.remove(), 500);
  }, 4000);
};
