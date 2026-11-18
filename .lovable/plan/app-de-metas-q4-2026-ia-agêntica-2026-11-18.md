# App de Metas Q4/2026 – IA Agêntica

## O que será construído
Um painel para acompanhar o planejamento do documento (7 frentes, P0/P1/P2), já pré-carregado com todo o conteúdo: objetivos, Key Results (OKRs), KPIs (fórmula, baseline, meta, frequência, responsável) e critérios de conclusão.

## Páginas
1. **Dashboard** (`/`) – visão geral:
   - Cabeçalho com % geral de completude (anel de progresso) e divisão P0 (~80%) vs P1/P2 (~20%).
   - Cartões por frente: prioridade, % de completude, barra de progresso, status (No prazo / Atenção / Em risco) e mini-lista de KRs.
   - Cartões de KPI com meta, valor atual, % e área de texto para observações.
   - Filtro por prioridade e gráfico de barras comparando frentes.
2. **Metas** (`/metas`) – lista das frentes; ao abrir, mostra objetivo, justificativa, riscos, dependências e cada KR com checkbox/controle de % (o % da frente é a média dos KRs).
3. **KPIs & OKRs** (`/kpis`) – tabela de KPIs, cada um com seus OKRs vinculados, campo de valor atual e notas.
4. **Relatório final** (`/relatorio`) – resumo executivo, % por frente, KRs concluídos/pendentes, KPIs e todas as notas; botão **Exportar PDF**.

## Visual
Tons pastéis (creme, sálvia, pêssego suave, lavanda clara) com verde musgo como cor principal; tipografia Fraunces (títulos) + DM Sans (texto); cartões arredondados, sombras leves, cores de status suaves.

## Dados
Progresso e anotações salvos no próprio navegador (sem login). Se quiser acesso de vários dispositivos/pessoas, dá para migrar para Lovable Cloud depois.

## Detalhes técnicos
- Dados do documento em `src/data/goals.ts`; estado em store com persistência em localStorage (carregado após hidratação).
- Gráficos com recharts; PDF gerado com jsPDF + autotable (texto real, quebras de página corretas).
- Rotas separadas com head() próprio; teste unitário do cálculo de % (média dos KRs, geral ponderado).
