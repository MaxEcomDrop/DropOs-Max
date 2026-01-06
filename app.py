import streamlit as st
import pandas as pd
import plotly.express as px
import time
import os
from supabase import create_client, Client
from datetime import datetime

# --- 1. CONFIGURAÇÃO IGUAL AO REACT ---
st.set_page_config(
    page_title="DropOS Max",
    page_icon="💜",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- 2. CONEXÃO SUPABASE ---
try:
    supa_url = os.environ.get("SUPABASE_URL") or st.secrets["supabase"]["url"]
    supa_key = os.environ.get("SUPABASE_KEY") or st.secrets["supabase"]["key"]
    supabase: Client = create_client(supa_url, supa_key)
except:
    st.warning("⚠️ Banco de dados desconectado. Rodando modo visualização.")
    supabase = None

# --- 3. ESTILIZAÇÃO (GLOBAL CSS - TEMA NUBANK) ---
st.markdown("""
<style>
    /* Variáveis CSS baseadas no código React */
    :root {
        --primary: #820AD1;
        --bg-card: #ffffff;
        --text-main: #111111;
    }
    
    /* Esconder elementos nativos para parecer App */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Botões Roxo Nubank */
    div.stButton > button {
        background-color: #820AD1;
        color: white;
        border-radius: 12px;
        border: none;
        height: 45px;
        font-weight: bold;
        width: 100%;
        transition: all 0.2s;
    }
    div.stButton > button:hover {
        background-color: #5c0694;
        transform: scale(1.02);
    }
    
    /* Cards */
    div[data-testid="stMetric"] {
        background-color: #F5F5F5;
        border-radius: 15px;
        padding: 15px;
        border-left: 4px solid #820AD1;
    }

    /* Bottom Nav (Mobile) */
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: white;
        border-top: 1px solid #eee;
        z-index: 9999;
        padding: 10px 0;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

# --- 4. ESTADO DA APLICAÇÃO (IGUAL AO REACT USESTATE) ---
if 'active_tab' not in st.session_state: st.session_state.active_tab = 'dashboard'
if 'is_olheiro' not in st.session_state: st.session_state.is_olheiro = False

def toggle_olheiro():
    st.session_state.is_olheiro = not st.session_state.is_olheiro

def set_tab(tab_name):
    st.session_state.active_tab = tab_name
    st.rerun()

# --- 5. COMPONENTES (IGUAL AO REACT) ---

def Sidebar():
    with st.sidebar:
        st.title("DropOS Max 💜")
        st.caption("Nu Edition - " + st.session_state.active_tab.upper())
        st.markdown("---")
        
        # Menu Desktop
        if st.button("📊 Dashboard"): set_tab('dashboard')
        if st.button("📦 Produtos"): set_tab('produtos')
        if st.button("💸 Vendas"): set_tab('vendas')
        if st.button("💰 Financeiro"): set_tab('financeiro')
        
        st.markdown("---")
        # Toggle Olheiro
        label_olheiro = "👁️ Desativar Olheiro" if st.session_state.is_olheiro else "🙈 Ativar Olheiro"
        if st.button(label_olheiro):
            toggle_olheiro()
            st.rerun()

def BottomNav():
    # Só aparece visualmente se for mobile (simulado por colunas no final)
    st.markdown("---")
    c1, c2, c3, c4 = st.columns(4)
    if c1.button("🏠\nDash"): set_tab('dashboard')
    if c2.button("📦\nProd"): set_tab('produtos')
    if c3.button("💸\nVenda"): set_tab('vendas')
    if c4.button("💰\nFin"): set_tab('financeiro')

# --- 6. TELAS (CONTEÚDO) ---

def format_money(valor):
    if st.session_state.is_olheiro:
        return "R$ ****"
    return f"R$ {valor:,.2f}"

def Dashboard():
    st.header(f"📊 Dashboard")
    
    # Busca dados se conectado
    total_vendas = 0
    lucro = 0
    if supabase:
        try:
            res = supabase.table("vendas").select("*").execute()
            df = pd.DataFrame(res.data)
            if not df.empty:
                total_vendas = df['valor_liquido'].sum()
                lucro = df['lucro_real'].sum()
        except: pass

    c1, c2 = st.columns(2)
    c1.metric("Vendas Totais", format_money(total_vendas))
    c2.metric("Lucro Líquido", format_money(lucro))

def Produtos():
    st.header("📦 Gestão de Produtos")
    
    with st.form("add_prod"):
        nome = st.text_input("Nome do Produto")
        sku = st.text_input("SKU")
        c1, c2 = st.columns(2)
        custo = c1.number_input("Custo", 0.0)
        venda = c2.number_input("Venda", 0.0)
        if st.form_submit_button("Salvar Produto"):
            if supabase:
                supabase.table("produtos").insert({
                    "nome": nome, "sku": sku, "custo": custo, "preco_venda": venda
                }).execute()
                st.success("Produto Salvo!")
                time.sleep(1)
                st.rerun()

    # Lista
    if supabase:
        res = supabase.table("produtos").select("*").execute()
        df = pd.DataFrame(res.data)
        if not df.empty:
            st.dataframe(df[['sku', 'nome', 'custo', 'preco_venda']], hide_index=True)

def Vendas():
    st.header("💸 Nova Venda")
    
    # Carregar produtos
    opcoes = []
    if supabase:
        res = supabase.table("produtos").select("nome").execute()
        opcoes = [item['nome'] for item in res.data]

    with st.form("nova_venda"):
        prod = st.selectbox("Produto", options=opcoes)
        qtd = st.number_input("Qtd", 1)
        val = st.number_input("Valor Recebido", 0.0)
        
        if st.form_submit_button("Confirmar Venda"):
            # Lógica simples de venda
            if supabase:
                # Pegar custo (simplificado)
                res_custo = supabase.table("produtos").select("custo").eq("nome", prod).execute()
                custo = res_custo.data[0]['custo'] if res_custo.data else 0
                
                lucro = val - (custo * qtd)
                
                supabase.table("vendas").insert({
                    "data_venda": str(datetime.now()),
                    "produto": prod, "qtd": qtd, 
                    "valor_liquido": val, "lucro_real": lucro
                }).execute()
                st.success("Venda Realizada!")

def Financeiro():
    st.header("💰 Financeiro")
    with st.form("fin"):
        desc = st.text_input("Descrição")
        val = st.number_input("Valor", 0.0)
        tipo = st.selectbox("Tipo", ["Entrada", "Saída"])
        if st.form_submit_button("Lançar"):
            if supabase:
                supabase.table("financeiro").insert({
                    "descricao": desc, "valor": val, "tipo": tipo
                }).execute()
                st.success("Lançado!")

# --- 7. RENDERIZAÇÃO PRINCIPAL ---
Sidebar()

if st.session_state.active_tab == 'dashboard': Dashboard()
elif st.session_state.active_tab == 'produtos': Produtos()
elif st.session_state.active_tab == 'vendas': Vendas()
elif st.session_state.active_tab == 'financeiro': Financeiro()

# Espaço para o menu não cobrir conteúdo no mobile
st.write("<br><br><br>", unsafe_allow_html=True)
BottomNav()
