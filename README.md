# ConfereLOG

Sistema profissional de validação e conferência de fretes para o Grupo Doce Mel.

## 📋 Sobre o Sistema

ConfereLOG é uma aplicação web corporativa desenvolvida para automatizar e otimizar o processo de conferência de fretes, identificando divergências entre dados do BI, aplicativo de fretes e tabela de preços de referência.

## ✨ Funcionalidades Principais

### 🔐 Autenticação
- Sistema de login com senha
- Sessão persistente
- Logout seguro

### 📤 Importação de Dados
- **Dados BI**: Importação de planilhas "Fretes de Saídas" do BI
- **Dados App Fretes**: Importação de planilhas do aplicativo de fretes
- **Tabela de Fretes**: Importação de tabela de preços por rota e veículo
- Suporte a formatos: XLSX, XLS, CSV
- Sistema de quinzenas para organização temporal
- Importação flexível (aceita dados incompletos)
- Suporte a cargas duplicadas (múltiplos fretes por carga)

### 🔍 Validação e Conferência
- Comparação automática entre valores BI, APP e Tabela
- Identificação de divergências em tempo real
- Cálculo de diferenças (BI x APP, BI x Tabela)
- Status visual: OK, Diverge, Sem Dados
- Filtros avançados por quinzena, data, fretista, rota e veículo
- Busca textual por carga, fretista ou rota

### 📝 Gestão de Divergências
- Adição de justificativas para divergências
- Histórico de justificativas por carga
- Compartilhamento via WhatsApp (individual ou em lote)
- Visualização dedicada apenas de divergências

### 📊 Dashboard Analítico
- **Métricas Gerais**: Total valor, quantidade de fretes, peso bruto, faturamento, % despesa, % ocupação, custo médio KG
- **Gráficos Interativos**:
  - Valor por fretista (Top 10)
  - Quantidade por rota (Top 10)
  - TOP 5 piores fretes (maior % despesa)
  - TOP 5 melhores fretes (menor % despesa)
- **Tabela Resumida**: Análise detalhada por fretista com todas as métricas
- **Filtros**: Por quinzena para análise temporal
- **Exportação**: Dados do dashboard em formato XLSX

### 📋 Histórico de Importações
- Registro automático de todas as importações
- Informações: data, arquivo, tipo, quantidade de linhas, menor/maior carga
- Rastreabilidade completa das operações

### 📥 Exportação de Dados
- Exportação em formato XLSX
- Mantém estrutura e formatação das tabelas
- Respeita filtros ativos
- Disponível em todas as telas (Validação, Divergências, Dashboard)

### 🎨 Interface
- Design profissional e corporativo
- Tema claro e escuro
- Layout responsivo (mobile, tablet, desktop)
- Tabelas compactas e otimizadas
- Filtros dinâmicos e intuitivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 16** - Framework React com App Router
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização utility-first
- **shadcn/ui** - Componentes UI de alta qualidade
- **Lucide React** - Ícones
- **Sonner** - Notificações toast

### Backend
- **Supabase** - Banco de dados PostgreSQL
- **Next.js API Routes** - Endpoints REST
- **XLSX** - Processamento de planilhas Excel

### Infraestrutura
- **Bun** - Runtime JavaScript de alta performance
- **Supabase** - Backend as a Service (BaaS)
- **Row Level Security (RLS)** - Segurança de dados

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `veiculos`
- Cadastro de veículos e fretistas
- Campos: fretista, placa, tipo

#### `dados_fretes` (APP)
- Dados importados do aplicativo de fretes
- Campos: id_carga, data, fretista, rota, valor_app, placa, tipo, status, id_quinzenal, justificativa

#### `dados_bi`
- Dados importados do BI
- Campos: id_carga, valor_bi, id_quinzenal

#### `tabela_fretes`
- Tabela de preços de referência
- Campos: rota, tipo_veiculo, valor_tabela, km, custo_km

#### `quinzenas`
- Controle de períodos de importação
- Campos: id_quinzenal, descricao, mes, ano, quinzena

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ ou Bun
- Conta no Supabase
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repository-url>
cd conferelog
```

2. **Instale as dependências**
```bash
bun install
# ou
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Autenticação
AUTH_PASSWORD=sua-senha-de-acesso
```

4. **Configure o banco de dados no Supabase**

Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Criar tabela de veículos
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fretista TEXT NOT NULL,
  placa TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de dados fretes (APP)
CREATE TABLE dados_fretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_carga TEXT NOT NULL,
  data TEXT NOT NULL,
  fretista TEXT NOT NULL,
  rota TEXT NOT NULL,
  valor_app DECIMAL(10,2) NOT NULL,
  placa TEXT,
  tipo TEXT,
  status TEXT,
  id_quinzenal TEXT,
  justificativa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de dados BI
CREATE TABLE dados_bi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_carga TEXT NOT NULL,
  valor_bi DECIMAL(10,2) NOT NULL,
  id_quinzenal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de fretes (preços de referência)
CREATE TABLE tabela_fretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota TEXT NOT NULL,
  tipo_veiculo TEXT NOT NULL,
  valor_tabela DECIMAL(10,2) NOT NULL,
  km INTEGER,
  custo_km DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rota, tipo_veiculo)
);

-- Criar tabela de quinzenas
CREATE TABLE quinzenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_quinzenal TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  quinzena INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_dados_fretes_id_carga ON dados_fretes(id_carga);
CREATE INDEX idx_dados_fretes_quinzenal ON dados_fretes(id_quinzenal);
CREATE INDEX idx_dados_bi_id_carga ON dados_bi(id_carga);
CREATE INDEX idx_dados_bi_quinzenal ON dados_bi(id_quinzenal);
CREATE INDEX idx_tabela_fretes_rota ON tabela_fretes(rota);

-- Habilitar RLS (Row Level Security)
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_bi ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabela_fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quinzenas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (permitir tudo para service_role)
CREATE POLICY "Allow all for service role" ON veiculos FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON dados_fretes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON dados_bi FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON tabela_fretes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON quinzenas FOR ALL USING (true);
```

5. **Sincronize os veículos (opcional)**

Se você tem dados de veículos em CSV:

```bash
bun run scripts/sync-veiculos.ts
```

6. **Inicie o servidor de desenvolvimento**

```bash
bun run dev
# ou
npm run dev
```

7. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📖 Como Usar

### 1. Login
- Acesse a aplicação
- Digite a senha configurada em `AUTH_PASSWORD`
- Clique em "Entrar"

### 2. Importar Dados

#### Importar Dados BI
1. Clique em "Importar dados BI"
2. Selecione o arquivo Excel do BI
3. No modal, escolha a quinzena (nova ou existente)
4. Confirme a importação

#### Importar Dados App Fretes
1. Clique em "Importar dados App Fretes"
2. Selecione o arquivo Excel do app
3. No modal, escolha a quinzena (nova ou existente)
4. Confirme a importação

#### Importar Tabela de Fretes
1. Clique em "Importar Tabela de Fretes"
2. Selecione o arquivo Excel da tabela
3. Importação é feita automaticamente (não requer quinzena)

### 3. Validar Fretes

1. Acesse a aba "Validação"
2. Visualize todos os fretes com status de conformidade
3. Use os filtros para encontrar dados específicos:
   - Quinzena
   - Data
   - Fretista
   - Rota
   - Veículo
4. Use a busca textual para encontrar cargas específicas

### 4. Gerenciar Divergências

1. Acesse a aba "Divergências"
2. Visualize apenas fretes com divergências
3. Clique no ícone de texto para adicionar justificativa
4. Clique no ícone do WhatsApp para compartilhar divergência

### 5. Visualizar Dashboard

1. Acesse a aba "Dashboard"
2. Visualize as métricas gerais:
   - Total de valores
   - Quantidade de fretes
   - Peso bruto total
   - Faturamento bruto
   - % despesa de frete
   - % taxa de ocupação
   - Custo médio por KG
3. Analise os gráficos:
   - Valor por fretista (Top 10)
   - Quantidade por rota (Top 10)
   - TOP 5 piores fretes (maior % despesa)
   - TOP 5 melhores fretes (menor % despesa)
4. Consulte a tabela resumida por fretista
5. Use o filtro de quinzena para análise temporal
6. Exporte os dados em XLSX

### 6. Alternar Tema

- Clique no ícone de lua/sol no header
- Escolha entre tema claro ou escuro
- Preferência é salva automaticamente

## 📁 Estrutura do Projeto

```
conferelog/
├── src/
│   ├── app/
│   │   ├── api/              # Endpoints da API
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── dashboard/    # Dashboard analítico
│   │   │   ├── fretes/       # Operações de fretes
│   │   │   ├── historico/    # Histórico de importações
│   │   │   ├── quinzenas/    # Gestão de quinzenas
│   │   │   ├── upload/       # Upload de arquivos
│   │   │   └── veiculos/     # Gestão de veículos
│   │   ├── dashboard/        # Página do dashboard
│   │   ├── globals.css       # Estilos globais
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── ExportButton.tsx  # Botão de exportação XLSX
│   │   ├── FilterBar.tsx     # Barra de filtros
│   │   ├── HistoricoImportacoes.tsx
│   │   ├── JustificativaDialog.tsx
│   │   └── QuinzenaModal.tsx
│   ├── hooks/                # React hooks customizados
│   └── lib/
│       ├── supabase.ts       # Cliente Supabase
│       └── utils.ts          # Utilitários
├── public/                   # Arquivos estáticos
│   ├── logo.png
│   ├── banner.gif
│   └── backgroundlogin.png
├── scripts/                  # Scripts utilitários
│   ├── clear-data.ts
│   ├── clear-data-sql.ts
│   └── sync-veiculos.ts
└── upload/                   # Arquivos de exemplo
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth` - Login
- `GET /api/auth` - Verificar sessão
- `DELETE /api/auth` - Logout

### Fretes
- `GET /api/fretes/validacao` - Listar validações
- `GET /api/fretes/validacao?divergentes=true` - Listar apenas divergências
- `GET /api/fretes/validacao?idQuinzenal=xxx` - Filtrar por quinzena
- `PATCH /api/fretes/justificativa` - Atualizar justificativa

### Dashboard
- `GET /api/dashboard` - Obter métricas e dados analíticos
- `GET /api/dashboard?idQuinzenal=xxx` - Filtrar dashboard por quinzena

### Histórico
- `GET /api/historico` - Listar histórico de importações

### Upload
- `POST /api/upload` - Importar arquivo (BI, APP ou TABELA)

### Quinzenas
- `GET /api/quinzenas` - Listar quinzenas
- `POST /api/quinzenas` - Criar quinzena

### Veículos
- `GET /api/veiculos` - Listar veículos
- `POST /api/veiculos` - Criar veículo

## 🎯 Regras de Negócio

### Importação
- Dados BI e APP requerem quinzena de referência
- Tabela de Fretes não requer quinzena (é referência fixa)
- Importar com quinzena existente substitui apenas dados daquela quinzena
- Uma carga pode ter múltiplos fretes (cargas duplicadas são permitidas)
- Apenas o campo "Valor" é obrigatório na importação APP

### Validação
- Tabela `dados_fretes` (APP) é a referência principal
- Comparação: BI x APP e BI x Tabela
- Status "OK": Valor BI = Valor Tabela (tolerância de R$ 0,01)
- Status "Diverge": Diferença > R$ 0,01
- Status "Sem Dados": Falta BI ou Tabela para comparação

### Justificativas
- Cada frete pode ter sua própria justificativa
- Justificativas são salvas por ID único (UUID), não por id_carga
- Múltiplos fretes da mesma carga podem ter justificativas diferentes

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev              # Inicia servidor de desenvolvimento

# Build
bun run build            # Cria build de produção

# Produção
bun start                # Inicia servidor de produção

# Utilitários
bun run scripts/sync-veiculos.ts      # Sincroniza veículos
bun run scripts/clear-data.ts         # Limpa dados (Supabase)
bun run scripts/clear-data-sql.ts     # Limpa dados (SQL direto)
```

## 🎨 Formato dos Arquivos de Importação

### Dados BI (Fretes de Saídas)
Colunas esperadas:
- Carga (número)
- Valor (R$)

### Dados App Fretes
Colunas esperadas:
- Data
- Tipo
- Fretista
- Contrato
- Motorista
- Placa
- Carga (número)
- Rota
- Valor (obrigatório)
- Status
- Observacoes
- Comentarios

### Tabela de Fretes
Colunas esperadas:
- Rota
- Tipo de Veículo
- Valor
- KM (opcional)
- Custo/KM (opcional)

## 🚨 Solução de Problemas

### Erro ao importar dados
- Verifique se o arquivo está no formato correto (XLSX, XLS ou CSV)
- Confirme que as colunas estão com os nomes esperados
- Verifique os logs no console do servidor

### Dados não aparecem na validação
- Confirme que os dados foram importados com sucesso
- Verifique se está filtrando pela quinzena correta
- Limpe os filtros e tente novamente

### Erro de conexão com Supabase
- Verifique as credenciais no arquivo `.env`
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase

### Tema não persiste
- Verifique se o localStorage está habilitado no navegador
- Limpe o cache do navegador e tente novamente

## 📝 Notas de Versão

### v1.0.0 (Atual)
- ✅ Sistema de autenticação
- ✅ Importação de dados BI, APP e Tabela
- ✅ Sistema de quinzenas
- ✅ Validação automática de fretes
- ✅ Identificação de divergências
- ✅ Justificativas por frete
- ✅ Filtros avançados
- ✅ Tema claro/escuro
- ✅ Compartilhamento via WhatsApp
- ✅ Design profissional e responsivo
- ✅ Migração completa para Supabase
- ✅ Suporte a cargas duplicadas

## 🤝 Suporte

Para suporte ou dúvidas sobre o sistema, entre em contato com a equipe de TI do Grupo Doce Mel.

## 📄 Licença

© 2026 Grupo Doce Mel. Todos os direitos reservados.

---

Desenvolvido com ❤️ para o Grupo Doce Mel
