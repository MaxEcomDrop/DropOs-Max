import { Produto, Venda, LancamentoFinanceiro, EstatisticasUsuario, ConfiguracoesApp, Missao, PrioridadeMissao } from '../types';

const CHAVES = {
  PRODUTOS: 'dropos_v15_prod',
  VENDAS: 'dropos_v15_vend',
  FINAN: 'dropos_v15_fin',
  ESTATS: 'dropos_v15_stat',
  CONFIG: 'dropos_v15_conf',
  MISSOES: 'dropos_v15_miss'
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const safeRead = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) { return defaultValue; }
};

export const storage = {
  configuracoes: {
    obter: (): ConfiguracoesApp => safeRead(CHAVES.CONFIG, {
      modoVisual: 'normal', modoGhost: false, mostrarXP: true, tema: 'dark',
      codename: 'OPERADOR ALFA', storeName: 'COMANDO DROP',
      metas: { mensal: 10000, diaria: 300 },
      financeiro: { regime: 'MEI', aliquotaImposto: 6, valorDasMensal: 72, reservaEmergencia: 0, porcentagemSocio: 0, porcentagemFuncionario: 5 },
      pomodoroTime: 25
    }),
    salvar: (conf: ConfiguracoesApp) => { 
      localStorage.setItem(CHAVES.CONFIG, JSON.stringify(conf)); 
      window.dispatchEvent(new Event('storage-update')); 
    }
  },

  vendas: {
    obterTodas: (): Venda[] => safeRead(CHAVES.VENDAS, []),
    salvar: (v: Partial<Venda>) => {
      const config = storage.configuracoes.obter();
      const todas = storage.vendas.obterTodas();
      
      const faturamento = Math.max(0, (v.valor_venda_un || 0) * (v.quantidade || 0));
      const recebido = Math.max(0, v.valor_liquido_recebido || 0);
      const custoCMV = Math.max(0, v.custo_mercadoria_total || 0);
      const ads = Math.max(0, v.custo_ads || 0);
      
      const impostos = (faturamento * config.financeiro.aliquotaImposto) / 100;
      const lucroOp = recebido - custoCMV - ads - impostos;
      const comissao = (lucroOp > 0 ? (lucroOp * config.financeiro.porcentagemFuncionario) / 100 : 0);
      const lucroFinal = lucroOp - comissao;
      
      const novaVenda = { 
        ...v, 
        id: generateId(), 
        faturamento_bruto: faturamento,
        taxas_plataforma: Math.max(0, faturamento - recebido),
        comissao_paga: comissao,
        lucro_real: lucroFinal 
      } as Venda;
      
      localStorage.setItem(CHAVES.VENDAS, JSON.stringify([...todas, novaVenda]));
      
      storage.financeiro.salvar({ 
        descricao: `Recebimento: ${novaVenda.produto_nome}`, valor: recebido, tipo: 'Receita', categoria: 'Vendas', status: 'Pago', venda_id: novaVenda.id, data: novaVenda.data_venda
      });

      storage.usuario.adicionarExp(150);
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
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
      const novo = { 
        ...l, 
        id: generateId(), 
        valor: Math.max(0, l.valor || 0),
        is_fixo: l.categoria === 'Software' || l.categoria === 'Fixo' || l.is_fixo
      };
      localStorage.setItem(CHAVES.FINAN, JSON.stringify([...todos, novo]));
      window.dispatchEvent(new Event('storage-update'));
    },
    excluir: (id: string) => {
      localStorage.setItem(CHAVES.FINAN, JSON.stringify(storage.financeiro.obterTodos().filter(f => f.id !== id)));
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
      localStorage.setItem(CHAVES.PRODUTOS, JSON.stringify(storage.produtos.obterTodos().filter(p => p.id !== id)));
      window.dispatchEvent(new Event('storage-update'));
    }
  },

  usuario: {
    obterEstats: (): EstatisticasUsuario => {
      const data = safeRead(CHAVES.ESTATS, { nivel: 1, experiencia: 0, proxNivelExp: 1000, patente: 'RECRUTA', sequencia: 1, conquistas: [], skills: [], health_score: 100 });
      let patente = 'RECRUTA';
      if (data.nivel > 50) patente = 'GENERAL';
      else if (data.nivel > 20) patente = 'COMANDANTE';
      else if (data.nivel > 5) patente = 'OPERADOR';
      return { ...data, patente };
    },
    adicionarExp: (exp: number) => {
      const stats = storage.usuario.obterEstats();
      stats.experiencia += exp;
      
      const text = document.createElement('div');
      text.className = 'xp-text';
      text.innerText = `+${exp} XP`;
      text.style.left = `${Math.random() * 40 + 30}%`;
      text.style.top = `${Math.random() * 20 + 40}%`;
      document.body.appendChild(text);
      setTimeout(() => text.remove(), 1200);

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
      const recompensa = Math.floor(Math.random() * 200) + 300;
      const nova: Missao = { id: generateId(), titulo, prioridade, data_alvo, recompensa, progresso: 0, objetivo: 1, completa: false, frequencia: 'Diária', categoria: 'Operacional' };
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
  t.className = "nu-card p-4 bg-[var(--bg-card)] border-l-4 border-[var(--nu-purple)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-wider flex items-center gap-3 animate-in slide-in-from-right duration-300 shadow-2xl";
  t.innerHTML = `<div class="w-2 h-2 rounded-full bg-[var(--nu-purple)]"></div> <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
    setTimeout(() => t.remove(), 300);
  }, 3000);
};
