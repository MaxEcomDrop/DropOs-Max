import streamlit as st
import pandas as pd
import plotly.express as px
import time
from supabase import create_client, Client
from datetime import datetime

# --- 1. CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(
    page_title="DropOS Max",
    page_icon="💜",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- 2. CONEXÃO COM SUPABASE (SEGREDOS) ---
try:
    # O Streamlit Cloud busca automaticamente no secrets.toml
    url = st.secrets["supabase"]["url"]
    key = st.secrets["supabase"]["key"]
    supabase: Client = create_client(url, key)
except Exception as e:
    st.error("⚠️ Erro de Conexão: Configure as chaves em 'Secrets' no painel do Streamlit.")
    st.stop()

# --- 3. ESTILIZAÇÃO (CSS NUBANK & MOBILE) ---
def local_css():
    st.markdown("""
    <style>
        /* Cores e Fundo */
        .stApp { background-color: #F5F5F5; }
        
        /* Esconder Elementos Padrão */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        [data-testid="stSidebarNav"] {display: none;}
        
        /* Botões Estilo Nubank */
        div.stButton > button {
            background-color: #820AD1;
            color: white;
            border-radius: 15px;
            border: none;
            height: 50px;
            font-weight: 600;
            width: 100%;
            transition: all 0.3s;
        }
        div.stButton > button:hover {
            background-color: #5c0694;
            transform: scale(1.02);
        }

        /* Cards de Métricas */
        div[data-testid="stMetric"] {
            background-color: white;
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border-left: 5px solid #820AD1;
        }

        /* Menu de Rodapé (Simulação Mobile) */
        .footer-nav {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            background-color: white;
            text-align: center;
            border-top: 1px solid #ddd;
            z-index: 999;
            padding: 10px 0;
        }
    </style>
    """, unsafe_allow_html=True)
local_css()

# --- 4. GESTÃO DE NAVEGAÇÃO ---
if 'pagina_atual' not in st.session_state:
    st.session_state['pagina_atual'] = 'Dashboard'

def navegar_para(destino):
    st.session_state['pagina_atual'] = destino
    st.rerun()

# --- 5. FUNÇÕES DE BANCO DE DADOS (CRUD) ---
def get_data(tabela):
    try:
        response = supabase.table(tabela).select("*").execute()
        return pd.DataFrame(response.data)
    except:
        return pd.DataFrame()

def insert_data(tabela, dados):
    try:
        supabase.table(tabela).insert(dados).execute()
        st.toast("✅ Salvo com sucesso!", icon="🚀")
        time.sleep(1)
        st.rerun()
    except Exception as e:
        st.error(f"Erro ao salvar: {e}")

# --- 6. TELAS DO SISTEMA ---

# A. DASHBOARD
def tela_dashboard():
    st.title("Olá, Chefe Max 💜")
    
    # Busca dados reais
    df_vendas = get_data("vendas")
    
    total_faturado = 0
    total_pedidos = 0
    lucro_estimado = 0

    if not df_vendas.empty:
        # Garante conversão para números
        df_vendas['valor_liquido'] = pd.to_numeric(df_vendas['valor_liquido'], errors='coerce')
        df_vendas['lucro_real'] = pd.to_numeric(df_vendas['lucro_real'], errors='coerce')
        
        total_faturado = df_vendas['valor_liquido'].sum()
        total_pedidos = len(df_vendas)
        lucro_estimado = df_vendas['lucro_real'].sum()

    col1, col2 = st.columns(2)
    col1.metric("Faturamento", f"R$ {total_faturado:,.2f}")
    col2.metric("Pedidos", total_pedidos)
    st.metric("Lucro Estimado", f"R$ {lucro_estimado:,.2f}")
    
    st.write("---")
    st.subheader("📊 Performance Recente")
    if not df_vendas.empty:
        fig = px.bar(df_vendas, x='data_venda', y='valor_liquido', title="Vendas por Dia", color_discrete_sequence=['#820AD1'])
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Faça a primeira venda para ver o gráfico!")

# B. VENDAS
def tela_vendas():
    st.header("💸 Nova Venda")
    
    # Select de Produtos Reais
    df_prod = get_data("produtos")
    lista_produtos = df_prod['nome'].tolist() if not df_prod.empty else []
    
    with st.form("form_venda", clear_on_submit=True):
        st.write("Preencha os dados da venda:")
        col_a, col_b = st.columns(2)
        produto = col_a.selectbox("Produto", lista_produtos)
        qtd = col_b.number_input("Qtd", min_value=1, value=1)
        
        valor_liq = st.number_input("Valor Líquido (Recebido)", min_value=0.0, format="%.2f")
        canal = st.selectbox("Canal", ["Mercado Livre", "Shopee", "WhatsApp"])
        
        if st.form_submit_button("✅ LANÇAR VENDA"):
            if not produto:
                st.error("Cadastre produtos primeiro!")
            else:
                # Busca custo automático
                custo_unit = 0
                if not df_prod.empty:
                    custo_unit = df_prod[df_prod['nome'] == produto]['custo'].values[0]
                
                custo_total = custo_unit * qtd
                lucro = valor_liq - custo_total
                
                payload = {
                    "data_venda": str(datetime.now()),
                    "produto": produto,
                    "qtd": qtd,
                    "valor_liquido": valor_liq,
                    "custo_produto": custo_total,
                    "lucro_real": lucro,
                    "canal": canal
                }
                insert_data("vendas", payload)

# C. ESTOQUE
def tela_estoque():
    st.header("📦 Estoque & Produtos")
    
    with st.form("form_produto", clear_on_submit=True):
        nome = st.text_input("Nome do Produto")
        sku = st.text_input("SKU / Código")
        col1, col2 = st.columns(2)
        custo = col1.number_input("Custo (R$)", min_value=0.0)
        preco = col2.number_input("Venda (R$)", min_value=0.0)
        
        if st.form_submit_button("💾 CADASTRAR PRODUTO"):
            insert_data("produtos", {
                "nome": nome, "sku": sku, "custo": custo, "preco_venda": preco
            })
            
    st.write("---")
    df = get_data("produtos")
    if not df.empty:
        st.dataframe(df[['sku', 'nome', 'custo', 'preco_venda']], hide_index=True)

# D. FINANCEIRO
def tela_financeiro():
    st.header("💰 Controle Financeiro")
    
    with st.form("form_fin"):
        desc = st.text_input("Descrição (Ex: Luz, Internet)")
        tipo = st.selectbox("Tipo", ["Saída", "Entrada"])
        valor = st.number_input("Valor (R$)", min_value=0.0)
        
        if st.form_submit_button("LANÇAR"):
            insert_data("financeiro", {"descricao": desc, "tipo": tipo, "valor": valor, "status": "Pendente"})
            
    st.dataframe(get_data("financeiro"), hide_index=True)

# --- 7. ROTEADOR DE TELAS ---
st.markdown('<div style="padding-top: 20px;"></div>', unsafe_allow_html=True)

if st.session_state['pagina_atual'] == 'Dashboard':
    tela_dashboard()
elif st.session_state['pagina_atual'] == 'Vendas':
    tela_vendas()
elif st.session_state['pagina_atual'] == 'Estoque':
    tela_estoque()
elif st.session_state['pagina_atual'] == 'Financeiro':
    tela_financeiro()

# --- 8. MENU DE NAVEGAÇÃO (RODAPÉ) ---
# Espaçador para o conteúdo não ficar atrás do menu
st.markdown('<div style="height: 100px;"></div>', unsafe_allow_html=True)

# Botões de Navegação
st.markdown("---")
c1, c2, c3, c4 = st.columns(4)

if c1.button("🏠\nInício"): navegar_para('Dashboard')
if c2.button("💸\nVender"): navegar_para('Vendas')
if c3.button("📦\nEstoque"): navegar_para('Estoque')
if c4.button("💰\nFinan"): navegar_para('Financeiro')
