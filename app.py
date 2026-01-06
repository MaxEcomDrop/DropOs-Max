import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from supabase import create_client, Client
from datetime import datetime, timedelta
import time

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(
    page_title="DropOS Max",
    page_icon="💜",
    layout="wide",
    initial_sidebar_state="collapsed" # Esconde sidebar nativa
)

# --- CONEXÃO COM SUPABASE ---
# Tenta conectar. Se falhar, avisa amigavelmente.
try:
    url = st.secrets["supabase"]["url"]
    key = st.secrets["supabase"]["key"]
    supabase: Client = create_client(url, key)
except Exception as e:
    st.error(f"⚠️ Erro de Conexão com o Banco de Dados: {e}")
    st.stop()

# --- ESTILIZAÇÃO CSS (NUBANK STYLE) ---
def local_css():
    st.markdown("""
    <style>
        /* Variáveis de Cores */
        :root {
            --primary-color: #820AD1; /* Roxo Nubank */
            --bg-color-light: #F5F5F5;
            --bg-color-dark: #191919;
            --card-light: #FFFFFF;
            --card-dark: #262626;
            --text-light: #191919;
            --text-dark: #F5F5F5;
        }

        /* Esconder Menu Padrão e Rodapé do Streamlit */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        [data-testid="stSidebarNav"] {display: none;} /* Esconde navegação lateral */
        
        /* Ajustes Globais */
        .block-container {
            padding-top: 2rem;
            padding-bottom: 5rem; /* Espaço para o menu inferior */
        }

        /* Cards Estilizados */
        div[data-testid="stMetric"], div.css-1r6slb0 {
            background-color: var(--card-light);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* Botões */
        div.stButton > button {
            background-color: #820AD1;
            color: white;
            border-radius: 20px;
            border: none;
            font-weight: bold;
            width: 100%;
        }
        div.stButton > button:hover {
            background-color: #5c0694;
            color: white;
        }

        /* Menu Inferior Fixo */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #FFFFFF; /* Ajustar conforme tema */
            z-index: 9999;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            border-top: 1px solid #eee;
        }
        
        /* Modo Escuro Forçado (se ativado via toggle) */
        /* Streamlit lida com dark mode nativo, mas podemos forçar classes se precisar */
        
    </style>
    """, unsafe_allow_html=True)

local_css()

# --- GESTÃO DE ESTADO (NAVEGAÇÃO) ---
if 'pagina_atual' not in st.session_state:
    st.session_state['pagina_atual'] = 'Dashboard'
if 'modo_olheiro' not in st.session_state:
    st.session_state['modo_olheiro'] = False

# --- FUNÇÕES DE NAVEGAÇÃO ---
def navegar_para(pagina):
    st.session_state['pagina_atual'] = pagina
    st.rerun() # Atualiza a tela imediatamente

# --- FUNÇÕES DE DADOS (CRUD) ---
def get_data(tabela):
    try:
        response = supabase.table(tabela).select("*").execute()
        return pd.DataFrame(response.data)
    except Exception as e:
        st.error(f"Erro ao buscar dados de {tabela}: {e}")
        return pd.DataFrame()

def insert_data(tabela, dados):
    try:
        supabase.table(tabela).insert(dados).execute()
        st.toast(f"✅ {tabela.capitalize()} salvo com sucesso!", icon="💾")
        time.sleep(1) # Dá tempo de ler
        st.rerun()
    except Exception as e:
        st.error(f"Erro ao salvar: {e}")

def delete_data(tabela, id_coluna, id_valor):
    try:
        supabase.table(tabela).delete().eq(id_coluna, id_valor).execute()
        st.toast("🗑️ Item excluído!")
        time.sleep(1)
        st.rerun()
    except Exception as e:
        st.error(f"Erro ao excluir: {e}")

# Função Formata Moeda (ou esconde no Modo Olheiro)
def fmt_moeda(valor):
    if st.session_state['modo_olheiro']:
        return "R$ ****"
    return f"R$ {valor:,.2f}"

# --- COMPONENTE MENU INFERIOR ---
def render_bottom_nav():
    # Cores dinâmicas para o botão ativo
    btn_style = "background:none; border:none; font-size:20px; cursor:pointer;"
    
    # Renderiza HTML puro para o menu fixo
    # Usamos botões do Streamlit invisíveis por cima ou colunas hackeadas
    # Simplificação: Usaremos st.columns no final da página com botões reais do Streamlit
    # Mas para ficar FIXO, o CSS lá em cima já ajuda.
    # Vamos usar uma abordagem nativa Streamlit com colunas fixas no container
    
    st.markdown("""
    <div style="position: fixed; bottom: 0; left: 0; width: 100%; background: #262626; padding: 10px; z-index: 99999; text-align: center; border-top: 2px solid #820AD1;">
    </div>
    """, unsafe_allow_html=True)
    
    # Criamos 4 colunas no fundo da tela
    # Nota: Streamlit não permite colocar widgets dentro de HTML puro facilmente.
    # Vamos usar colunas normais mas com CSS que as fixa embaixo é complexo.
    # Solução Prática: Sidebar para Configurações + Menu de Botões no Topo OU Rodapé Simulado.
    # Para mobile, o melhor é st.columns no final da renderização.
    
    # SPACER (Para o conteúdo não ficar atrás do menu)
    st.markdown('<div style="height: 100px;"></div>', unsafe_allow_html=True)
    
    # MENU DE NAVEGAÇÃO (Hack para ficar fixo embaixo visualmente)
    with st.container():
        st.markdown(
            """
            <style>
                div[data-testid="stHorizontalBlock"] {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #1E1E1E; /* Fundo Menu */
                    padding: 10px 5px;
                    z-index: 99999;
                    border-top: 3px solid #820AD1;
                }
                div[data-testid="stHorizontalBlock"] button {
                    background-color: transparent !important;
                    border: none !important;
                    color: white !important;
                    font-size: 12px;
                }
                div[data-testid="stHorizontalBlock"] button:hover {
                    color: #820AD1 !important;
                }
            </style>
            """, 
            unsafe_allow_html=True
        )
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            if st.button("🏠\nHome"): navegar_para('Dashboard')
        with c2:
            if st.button("💸\nVendas"): navegar_para('Vendas')
        with c3:
            if st.button("📦\nEstoque"): navegar_para('Estoque')
        with c4:
            if st.button("💰\nFinan"): navegar_para('Financeiro')

# --- MÓDULOS (TELAS) ---

# 1. DASHBOARD
def tela_dashboard():
    st.title(f"Olá, Chefe Max 💜")
    
    # Toggle Modo Olheiro e Tema
    col_top1, col_top2 = st.columns(2)
    with col_top1:
        check_olheiro = st.checkbox("👁️ Modo Olheiro", value=st.session_state['modo_olheiro'])
        if check_olheiro != st.session_state['modo_olheiro']:
            st.session_state['modo_olheiro'] = check_olheiro
            st.rerun()
            
    # Dados Reais
    df_vendas = get_data("vendas")
    df_fin = get_data("financeiro")
    
    # Cálculos Rápidos
    total_vendas_hoje = 0
    lucro_hoje = 0
    
    if not df_vendas.empty:
        df_vendas['data'] = pd.to_datetime(df_vendas['data_venda'])
        hoje = pd.Timestamp.now().normalize()
        vendas_hoje = df_vendas[df_vendas['data'].dt.normalize() == hoje]
        
        # Correção: Converter colunas para numérico se vierem como string
        vendas_hoje['valor_liquido'] = pd.to_numeric(vendas_hoje['valor_liquido'], errors='coerce')
        vendas_hoje['custo_produto'] = pd.to_numeric(vendas_hoje['custo_produto'], errors='coerce')
        
        total_vendas_hoje = vendas_hoje['valor_liquido'].sum()
        lucro_hoje = total_vendas_hoje - vendas_hoje['custo_produto'].sum()

    # Cards (KPIs)
    c1, c2 = st.columns(2)
    c1.metric("Vendas Hoje", fmt_moeda(total_vendas_hoje))
    c2.metric("Lucro Hoje", fmt_moeda(lucro_hoje), delta_color="normal")

    # Gráfico Gauge (Score de Saúde)
    margem = 0
    if total_vendas_hoje > 0:
        margem = (lucro_hoje / total_vendas_hoje) * 100
        
    fig_gauge = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = margem,
        title = {'text': "Saúde (Margem %)"},
        gauge = {'axis': {'range': [0, 100]},
                 'bar': {'color': "#820AD1"},
                 'steps': [
                     {'range': [0, 20], 'color': "#FF5252"},
                     {'range': [20, 100], 'color': "#03D56F"}]}))
    st.plotly_chart(fig_gauge, use_container_width=True)

    # Gráfico Melhor Dia
    if not df_vendas.empty:
        df_vendas['dia_semana'] = df_vendas['data'].dt.day_name()
        vendas_dia = df_vendas.groupby('dia_semana')['valor_liquido'].sum().reset_index()
        fig_bar = px.bar(vendas_dia, x='dia_semana', y='valor_liquido', title="Vendas por Dia", color_discrete_sequence=['#820AD1'])
        st.plotly_chart(fig_bar, use_container_width=True)
    else:
        st.info("Faça a primeira venda para ver os gráficos!")

# 2. VENDAS
def tela_vendas():
    st.header("💸 Nova Venda")
    
    # Carregar produtos para o select
    df_prods = get_data("produtos")
    lista_prods = []
    dict_custos = {}
    
    if not df_prods.empty:
        lista_prods = df_prods['nome'].tolist()
        # Criar dicionário {Nome: Custo} para cálculo automático
        for index, row in df_prods.iterrows():
            dict_custos[row['nome']] = row['custo']
    
    with st.form("form_venda", clear_on_submit=True):
        col1, col2 = st.columns(2)
        data = col1.date_input("Data", datetime.now())
        canal = col2.selectbox("Canal", ["Mercado Livre", "Shopee", "WhatsApp", "Balcão"])
        
        cnpj = st.selectbox("Loja (CNPJ)", ["Loja Max (Principal)", "Império da Pururuca"])
        produto_selecionado = st.selectbox("Produto", lista_prods)
        qtd = st.number_input("Quantidade", min_value=1, value=1)
        
        st.markdown("---")
        st.markdown("### 💰 Financeiro da Venda")
        valor_bruto = st.number_input("Valor Bruto (Cliente Pagou)", min_value=0.0, format="%.2f")
        valor_liquido = st.number_input("Valor Líquido (Recebido)", min_value=0.0, format="%.2f")
        
        # Botão de Salvar
        submitted = st.form_submit_button("✅ CONFIRMAR VENDA")
        
        if submitted:
            if not produto_selecionado:
                st.error("Selecione um produto!")
            else:
                custo_unit = dict_custos.get(produto_selecionado, 0)
                custo_total = custo_unit * qtd
                lucro = valor_liquido - custo_total
                
                dados_venda = {
                    "data_venda": str(data),
                    "canal": canal,
                    "loja": cnpj,
                    "produto": produto_selecionado,
                    "qtd": qtd,
                    "valor_bruto": valor_bruto,
                    "valor_liquido": valor_liquido,
                    "custo_produto": custo_total,
                    "lucro_real": lucro
                }
                
                insert_data("vendas", dados_venda)
                
                # Feedback Imediato
                if lucro < 0:
                    st.error(f"⚠️ PREJUÍZO DE R$ {lucro:.2f}")
                else:
                    st.success(f"🤑 LUCRO DE R$ {lucro:.2f}")

    # Histórico Recente
    st.subheader("Últimas Vendas")
    df_vendas = get_data("vendas")
    if not df_vendas.empty:
        # Mostra apenas colunas essenciais
        st.dataframe(df_vendas[['data_venda', 'produto', 'valor_liquido', 'lucro_real']].sort_values(by='data_venda', ascending=False), hide_index=True)

# 3. ESTOQUE (PRODUTOS)
def tela_estoque():
    st.header("📦 Gestão de Produtos")
    
    # Abas: Cadastro e Lista
    tab1, tab2 = st.tabs(["➕ Novo Produto", "📋 Lista & Edição"])
    
    # Pegar Fornecedores para o Select
    df_forn = get_data("fornecedores")
    lista_forn = df_forn['nome'].tolist() if not df_forn.empty else []
    
    with tab1:
        with st.form("form_produto", clear_on_submit=True):
            sku = st.text_input("SKU (Código)")
            nome = st.text_input("Nome do Produto")
            tipo = st.selectbox("Tipo", ["Estoque Físico", "Virtual (Drop)"])
            fornecedor = st.selectbox("Fornecedor", lista_forn)
            custo = st.number_input("Custo (R$)", min_value=0.0, format="%.2f")
            preco = st.number_input("Preço Venda (R$)", min_value=0.0, format="%.2f")
            
            if st.form_submit_button("Salvar Produto"):
                insert_data("produtos", {
                    "sku": sku, "nome": nome, "tipo": tipo, 
                    "fornecedor": fornecedor, "custo": custo, "preco_venda": preco
                })
    
    with tab2:
        df_prods = get_data("produtos")
        if not df_prods.empty:
            # ALERTA DE ZUMBIS (Simulação simples por enquanto)
            # Idealmente cruzaria com tabela de vendas.
            st.info("💡 Dica: Edite os valores direto na tabela abaixo.")
            
            # Editor de Dados (CRUD Update)
            edited_df = st.data_editor(df_prods, num_rows="dynamic", key="editor_prods")
            
            # Botão para salvar alterações em massa seria complexo aqui.
            # Vamos manter simples: Visualização. 
            # Para update real no data_editor precisa de callback, 
            # mas vamos deixar só visualização + cadastro novo por segurança no MVP.
        else:
            st.warning("Nenhum produto cadastrado.")

# 4. FINANCEIRO & FORNECEDORES
def tela_financeiro():
    st.header("💰 Financeiro & Fornecedores")
    
    sub_menu = st.radio("Módulo:", ["Contas (Caixa)", "Fornecedores"], horizontal=True)
    
    if sub_menu == "Contas (Caixa)":
        with st.expander("➕ Nova Movimentação (Pagar/Receber)", expanded=True):
            with st.form("form_fin"):
                tipo = st.selectbox("Tipo", ["Saída (Pagar)", "Entrada (Receber)"])
                desc = st.text_input("Descrição (Ex: Luz, Internet)")
                valor = st.number_input("Valor R$", min_value=0.0, format="%.2f")
                venc = st.date_input("Vencimento")
                pago = st.checkbox("Já foi pago?")
                
                if st.form_submit_button("Lançar"):
                    insert_data("financeiro", {
                        "tipo": tipo, "descricao": desc, "valor": valor, 
                        "vencimento": str(venc), "status": "Pago" if pago else "Pendente"
                    })
        
        # Tabela
        df_fin = get_data("financeiro")
        if not df_fin.empty:
            st.dataframe(df_fin, hide_index=True)
            
            # Alerta de Quebra
            saidas_pendentes = df_fin[(df_fin['tipo'] == "Saída (Pagar)") & (df_fin['status'] == "Pendente")]['valor'].sum()
            st.markdown(f"**🔴 Contas a Pagar (Pendente):** R$ {saidas_pendentes:.2f}")

    elif sub_menu == "Fornecedores":
        with st.form("form_forn"):
            nome_f = st.text_input("Nome Empresa")
            contato = st.text_input("WhatsApp / Contato")
            haver = st.number_input("Saldo de Haver (Crédito)", value=0.0)
            
            if st.form_submit_button("Salvar Fornecedor"):
                insert_data("fornecedores", {"nome": nome_f, "contato": contato, "saldo_haver": haver})
        
        df_forn = get_data("fornecedores")
        if not df_forn.empty:
            st.dataframe(df_forn, hide_index=True)

# --- SIDEBAR (FERRAMENTAS EXTRAS) ---
with st.sidebar:
    st.title("⚙️ DropOS Tools")
    st.markdown("---")
    
    # Timer Pomodoro
    if st.button("🍅 Iniciar Pomodoro (25min)"):
        with st.empty():
            for seconds in range(1500, 0, -1):
                mins, secs = divmod(seconds, 60)
                st.metric("Foco", f"{mins:02d}:{secs:02d}")
                time.sleep(1)
            st.success("Tempo esgotado! Descanse.")
    
    st.markdown("---")
    st.subheader("📝 Bloco de Ideias")
    st.text_area("Notas rápidas", height=150)
    
    st.markdown("---")
    if st.button("🗑️ Limpar Cache do App"):
        st.cache_data.clear()
        st.rerun()

# --- ROTEAMENTO FINAL ---
if st.session_state['pagina_atual'] == 'Dashboard':
    tela_dashboard()
elif st.session_state['pagina_atual'] == 'Vendas':
    tela_vendas()
elif st.session_state['pagina_atual'] == 'Estoque':
    tela_estoque()
elif st.session_state['pagina_atual'] == 'Financeiro':
    tela_financeiro()

# Renderiza o menu fixo no final de tudo
render_bottom_nav()
