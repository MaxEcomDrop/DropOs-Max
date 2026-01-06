import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import time
import os
from supabase import create_client, Client
from datetime import datetime

# --- 1. CONFIGURAÇÃO INICIAL (FULLSCREEN & TITLE) ---
st.set_page_config(
    page_title="DropOS Max",
    page_icon="💜",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- 2. CONEXÃO HÍBRIDA (SUPABASE) ---
try:
    # Tenta variáveis de ambiente (Render) ou Secrets (Streamlit Cloud)
    supa_url = os.environ.get("SUPABASE_URL") or st.secrets["supabase"]["url"]
    supa_key = os.environ.get("SUPABASE_KEY") or st.secrets["supabase"]["key"]
    supabase: Client = create_client(supa_url, supa_key)
    conexao_status = True
except:
    conexao_status = False 
    # Não paramos o app, rodamos em modo "Offline Visual" para você ver o design

# --- 3. INJEÇÃO DE CSS "NUCLEAR" (VISUAL REACT/NUBANK) ---
st.markdown("""
<style>
    /* IMPORTAR FONTE MODERNA */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

    /* === GERAL (DARK MODE PROFUNDO) === */
    .stApp {
        background-color: #000000; /* Preto Absoluto */
        font-family: 'Inter', sans-serif;
    }
    
    /* ESCONDER O "LIXO" PADRÃO DO STREAMLIT */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    [data-testid="stSidebar"] {display: none;} /* Esconde Sidebar nativa */
    
    /* === CARDS E MÉTRICAS === */
    div[data-testid="stMetric"] {
        background-color: #111111; /* Cinza Nubank */
        border: 1px solid #333333;
        border-radius: 16px;
        padding: 15px;
        color: white;
        transition: transform 0.2s;
    }
    div[data-testid="stMetric"]:hover {
        border-color: #820AD1; /* Brilho Roxo ao passar mouse */
    }
    [data-testid="stMetricLabel"] {
        color: #A3A3A3 !important; /* Texto cinza claro */
        font-size: 12px !important;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    [data-testid="stMetricValue"] {
        color: #F5F5F5 !important; /* Branco */
        font-weight: 800 !important;
    }

    /* === BOTÕES (ESTILO APP NATIVO) === */
    div.stButton > button {
        background-color: #820AD1; /* Roxo Nubank */
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
        letter-spacing: 0.5px;
        width: 100%;
        transition: all 0.3s ease;
    }
    div.stButton > button:hover {
        background-color: #9933FF;
        box-shadow: 0px 4px 15px rgba(130, 10, 209, 0.4);
        transform: translateY(-2px);
    }
    div.stButton > button:active {
        background-color: #5c0694;
    }

    /* === INPUTS E FORMULÁRIOS === */
    .stTextInput > div > div > input, 
    .stNumberInput > div > div > input,
    .stSelectbox > div > div > div {
        background-color: #111111;
        color: white;
        border: 1px solid #333333;
        border-radius: 10px;
    }
    .stTextInput > div > div > input:focus {
        border-color: #820AD1;
        box-shadow: none;
    }
    label {
        color: #A3A3A3 !important;
    }

    /* === BOTTOM NAVIGATION (SIMULADO) === */
    /* Criamos uma área fixa no rodapé para os botões */
    .block-container {
        padding-bottom: 120px; /* Espaço para não cobrir conteúdo */
    }
    
    /* Títulos */
    h1, h2, h3 {
        color: #F5F5F5 !important;
        font-weight: 800 !important;
    }
    
    /* Tabelas */
    [data-testid="stDataFrame"] {
        background-color: #111111;
        border-radius: 10px;
        padding: 10px;
    }
</style>
""", unsafe_allow_html=True)

# --- 4. GESTÃO DE ESTADO (MEMORY) ---
if 'page' not in st.session_state: st.session_state.page = 'dashboard'
if 'olheiro' not in st.session_state: st.session_state.olheiro = False

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

def toggle_olheiro():
    st.session_state.olheiro = not st.session_state.olheiro
    st.rerun()

# --- 5. FUNÇÕES AUXILIARES ---
def fmt_money(value):
    if st.session_state.olheiro:
        return "R$ ****"
    return f"R$ {float(value):,.2f}"

def get_data(table):
    if not conexao_status: return pd.DataFrame()
    try:
        res = supabase.table(table).select("*").execute()
        return pd.DataFrame(res.data)
    except: return pd.DataFrame()

def save_data(table, payload):
    if not conexao_status:
        st.error("Sem conexão com Banco de Dados.")
        return
    try:
        supabase.table(table).insert(payload).execute()
        st.toast("Salvo com sucesso!", icon="✅")
        time.sleep(0.5)
        st.rerun()
    except Exception as e:
        st.error(f"Erro: {e}")

# --- 6. TELAS DO SISTEMA (VIEWS) ---

def Dashboard():
    # Cabeçalho Estilizado
    c1, c2 = st.columns([3, 1])
    c1.title("DropOS Max")
    if c2.button(f"{'🙈' if st.session_state.olheiro else '👁️'}"):
        toggle_olheiro()

    # Dados
    df_v = get_data("vendas")
    total_fat = df_v['valor_liquido'].sum() if not df_v.empty else 0
    total_lucro = df_v['lucro_real'].sum() if not df_v.empty else 0
    
    # Cards (Métricas)
    col1, col2 = st.columns(2)
    col1.metric("Faturamento", fmt_money(total_fat), delta="Total Geral")
    col2.metric("Lucro Líquido", fmt_money(total_lucro), delta="Margem Real")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Gráfico Dark Mode
    if not df_v.empty:
        st.caption("DESEMPENHO RECENTE")
        df_v['data'] = pd.to_datetime(df_v['data_venda'])
        daily = df_v.groupby('data')['valor_liquido'].sum().reset_index()
        
        fig = px.bar(daily, x='data', y='valor_liquido', color_discrete_sequence=['#820AD1'])
        fig.update_layout(
            plot_bgcolor='#000000',
            paper_bgcolor='#000000',
            font_color='#A3A3A3',
            xaxis_showgrid=False,
            yaxis_showgrid=True,
            yaxis_gridcolor='#333333',
            margin=dict(l=0, r=0, t=0, b=0)
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Nenhuma venda registrada ainda.")

def Vendas():
    st.title("Nova Venda 💸")
    
    # Busca produtos
    df_p = get_data("produtos")
    opts = df_p['nome'].tolist() if not df_p.empty else []
    
    with st.form("form_venda"):
        st.caption("DETALHES DO PEDIDO")
        prod = st.selectbox("Produto", opts)
        qtd = st.number_input("Quantidade", 1)
        val_liq = st.number_input("Valor Líquido (R$)", 0.0)
        canal = st.selectbox("Canal", ["Mercado Livre", "Shopee", "WhatsApp"])
        
        btn = st.form_submit_button("CONFIRMAR VENDA")
        if btn:
            # Lógica de Custo/Lucro
            custo = 0
            if not df_p.empty:
                filtro = df_p[df_p['nome'] == prod]
                if not filtro.empty: custo = float(filtro.iloc[0]['custo'])
            
            custo_total = custo * qtd
            lucro = val_liq - custo_total
            
            save_data("vendas", {
                "data_venda": str(datetime.now()),
                "produto": prod, "qtd": qtd, "valor_liquido": val_liq,
                "custo_produto": custo_total, "lucro_real": lucro, "canal": canal
            })

    # Lista Recente
    st.markdown("<br><h5>Histórico Recente</h5>", unsafe_allow_html=True)
    df_v = get_data("vendas")
    if not df_v.empty:
        st.dataframe(df_v[['produto', 'valor_liquido', 'canal']].tail(5), hide_index=True)

def Estoque():
    st.title("Estoque 📦")
    
    tab1, tab2 = st.tabs(["Novo Produto", "Lista"])
    with tab1:
        with st.form("new_prod"):
            nome = st.text_input("Nome")
            sku = st.text_input("SKU")
            c1, c2 = st.columns(2)
            custo = c1.number_input("Custo R$", 0.0)
            venda = c2.number_input("Venda R$", 0.0)
            if st.form_submit_button("SALVAR"):
                save_data("produtos", {"nome": nome, "sku": sku, "custo": custo, "preco_venda": venda})
    
    with tab2:
        df = get_data("produtos")
        if not df.empty:
            st.dataframe(df, hide_index=True)

def Financeiro():
    st.title("Financeiro 💰")
    with st.form("fin"):
        desc = st.text_input("Descrição")
        tipo = st.selectbox("Tipo", ["Saída", "Entrada"])
        val = st.number_input("Valor R$", 0.0)
        if st.form_submit_button("LANÇAR"):
            save_data("financeiro", {"descricao": desc, "tipo": tipo, "valor": val})
    
    df = get_data("financeiro")
    if not df.empty:
        st.dataframe(df, hide_index=True)

# --- 7. ROTEADOR DE PÁGINAS ---
if st.session_state.page == 'dashboard': Dashboard()
elif st.session_state.page == 'vendas': Vendas()
elif st.session_state.page == 'estoque': Estoque()
elif st.session_state.page == 'financeiro': Financeiro()

# --- 8. BOTTOM NAVIGATION (FIXED BAR) ---
st.write("---")
st.markdown("""
<div style="position: fixed; bottom: 0; left: 0; width: 100%; background-color: #111111; padding: 10px; border-top: 1px solid #333; z-index: 999999;">
    </div>
""", unsafe_allow_html=True)

# Botões de Navegação (Hackeados para parecer Tab Bar)
cols = st.columns(4)
with cols[0]:
    if st.button("🏠\nHome", key="btn_home"): navigate_to('dashboard')
with cols[1]:
    if st.button("💸\nVenda", key="btn_venda"): navigate_to('vendas')
with cols[2]:
    if st.button("📦\nProd", key="btn_prod"): navigate_to('estoque')
with cols[3]:
    if st.button("💰\nFin", key="btn_fin"): navigate_to('financeiro')
