# 📊 Dashboard - Guia do Usuário

## Visão Geral

O Dashboard do ConfereLOG oferece uma visão analítica completa dos seus fretes, permitindo monitorar performance, identificar tendências e tomar decisões baseadas em dados.

## Como Acessar

1. Faça login no sistema
2. Clique na aba **"Dashboard"** no menu principal
3. O dashboard carregará automaticamente com todos os dados disponíveis

## Componentes do Dashboard

### 📈 Cards de Métricas (Topo)

Exibe 7 indicadores-chave de performance:

1. **Total Valor** 💰
   - Soma de todos os valores de frete (APP)
   - Indica o volume financeiro total

2. **Qtd Fretes** 📦
   - Quantidade total de fretes registrados
   - Útil para medir volume de operações

3. **Peso Bruto** ⚖️
   - Soma do peso bruto de todas as cargas
   - Medido em quilogramas (kg)

4. **Faturamento** 💵
   - Soma do valor das cargas (BI)
   - Representa o faturamento bruto

5. **% Despesa** 📊
   - Percentual médio de despesa de entrega
   - Quanto menor, melhor a eficiência

6. **% Ocupação** 📈
   - Taxa média de ocupação dos veículos
   - Indica aproveitamento da capacidade

7. **Custo KG** 💲
   - Custo médio por quilograma transportado
   - Métrica de eficiência operacional

### 📊 Gráficos Analíticos

#### 1. Valor por Fretista (Top 10)
- **Tipo**: Gráfico de barras
- **Cor**: Verde (#0F5132)
- **Mostra**: Os 10 fretistas com maior valor total
- **Uso**: Identificar principais parceiros de transporte

#### 2. Quantidade por Rota (Top 10)
- **Tipo**: Gráfico de barras
- **Cor**: Dourado (#D4AF37)
- **Mostra**: As 10 rotas com mais fretes
- **Uso**: Identificar rotas mais movimentadas

#### 3. TOP 5 Piores Fretes
- **Tipo**: Gráfico de barras
- **Cor**: Vermelho (#DC2626)
- **Mostra**: 5 fretes com maior % de despesa
- **Uso**: Identificar fretes problemáticos que precisam atenção

#### 4. TOP 5 Melhores Fretes
- **Tipo**: Gráfico de barras
- **Cor**: Verde (#16A34A)
- **Mostra**: 5 fretes com menor % de despesa
- **Uso**: Identificar fretes eficientes como referência

### 📋 Tabela Resumida por Fretista

Análise detalhada de cada fretista com as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| **Fretista** | Nome do transportador |
| **Valor Total** | Soma de todos os fretes (R$) |
| **Qtd Entregas** | Quantidade de entregas realizadas |
| **% Despesa Frete** | Percentual médio de despesa |
| **% Ocupação** | Taxa média de ocupação |
| **Custo KG** | Custo médio por quilograma (R$) |
| **Peso Total** | Soma do peso transportado (kg) |
| **Peso Médio** | Peso médio por entrega (kg) |

## Filtros Disponíveis

### Filtro de Quinzena
- Localizado no topo do dashboard
- Permite filtrar todos os dados por período
- Útil para análise temporal e comparações

**Como usar**:
1. Clique no dropdown "Quinzena"
2. Selecione o período desejado
3. O dashboard atualizará automaticamente

### Limpar Filtros
- Botão vermelho "Limpar filtros"
- Remove todos os filtros aplicados
- Volta para visualização completa

## Exportação de Dados

### Como Exportar
1. Clique no botão **"Exportar"** no canto superior direito da tabela
2. Um arquivo XLSX será baixado automaticamente
3. Nome do arquivo: `dashboard-resumo-fretistas.xlsx`

### O que é Exportado
- Todos os dados da tabela resumida
- Mantém a estrutura e formatação
- Inclui todas as colunas e métricas
- Respeita filtros ativos

## Interação com Gráficos

### Recursos Interativos
- **Hover**: Passe o mouse sobre as barras para ver valores exatos
- **Tooltip**: Informações detalhadas aparecem ao passar o mouse
- **Legenda**: Identifica o que cada cor representa

### Dicas de Uso
- Gráficos são responsivos e se adaptam ao tamanho da tela
- Em dispositivos móveis, role horizontalmente se necessário
- Valores são formatados em Real brasileiro (R$)

## Interpretação dos Dados

### Métricas Positivas (Quanto Maior, Melhor)
- Total Valor
- Quantidade de Fretes
- Peso Bruto
- Faturamento
- % Ocupação

### Métricas Negativas (Quanto Menor, Melhor)
- % Despesa Frete
- Custo KG

### Análise Recomendada

#### Para Gestores
1. Monitore o **Total Valor** e **Faturamento** para acompanhar receita
2. Analise **% Despesa** para identificar oportunidades de redução de custos
3. Use **TOP 5 Piores** para priorizar ações corretivas
4. Compare **% Ocupação** para otimizar uso de veículos

#### Para Operacional
1. Verifique **Quantidade por Rota** para planejar recursos
2. Analise **Valor por Fretista** para negociações
3. Use **Custo KG** para avaliar eficiência de transporte
4. Monitore **Peso Médio** para otimizar carregamento

#### Para Financeiro
1. Acompanhe **Faturamento** vs **Total Valor** para margem
2. Analise **% Despesa** para controle de custos
3. Use exportação para análises detalhadas em Excel
4. Compare quinzenas para identificar tendências

## Tema Escuro

O dashboard suporta tema escuro para melhor visualização em ambientes com pouca luz.

**Como alternar**:
1. Clique no ícone de lua/sol no header
2. O tema mudará instantaneamente
3. Preferência é salva automaticamente

## Responsividade

O dashboard é totalmente responsivo:

### Desktop (> 1024px)
- 7 cards em linha
- 4 gráficos em grade 2x2
- Tabela completa visível

### Tablet (768px - 1024px)
- Cards em 2-3 colunas
- Gráficos em 2 colunas
- Tabela com scroll horizontal

### Mobile (< 768px)
- Cards empilhados
- Gráficos empilhados
- Tabela com scroll horizontal
- Filtros empilhados

## Perguntas Frequentes

### Por que alguns dados aparecem como "0" ou "-"?
Isso ocorre quando não há dados do BI para aquele frete. O sistema calcula apenas com os dados disponíveis.

### Como comparar diferentes quinzenas?
Use o filtro de quinzena para visualizar cada período separadamente. Para comparação lado a lado, exporte os dados de cada quinzena.

### Os gráficos são atualizados em tempo real?
Não. Os dados são carregados ao abrir o dashboard ou ao mudar o filtro de quinzena. Para atualizar, recarregue a página.

### Posso exportar os gráficos?
Atualmente, apenas a tabela pode ser exportada. Para gráficos, use a função de captura de tela do seu navegador.

### Quantos registros o dashboard suporta?
O dashboard foi otimizado para lidar com milhares de registros. Se notar lentidão, use o filtro de quinzena para reduzir o volume de dados.

## Dicas de Performance

1. **Use filtros**: Filtre por quinzena para análises mais rápidas
2. **Exporte dados**: Para análises complexas, exporte e use Excel
3. **Atualize periodicamente**: Recarregue a página após novas importações
4. **Tema escuro**: Pode melhorar performance em alguns dispositivos

## Suporte

Para problemas ou dúvidas:
1. Verifique se os dados foram importados corretamente
2. Tente limpar os filtros
3. Recarregue a página
4. Entre em contato com o suporte técnico

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
