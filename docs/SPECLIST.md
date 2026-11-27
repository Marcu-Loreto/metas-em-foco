# Speclist completa — Metas em Foco

Legenda: [x] implementado · [ ] futuro

## 1. Stack técnica
- [x] TanStack Start v1 (React 19) + Vite 7, Tailwind CSS v4 com tokens em `src/styles.css`
- [x] Estado: zustand com persistência em localStorage (chave `metas-q4-2026`, hidratação após montar)
- [x] Gráficos: recharts · PDF: jsPDF + autotable · Calendário: shadcn Calendar (pt-BR) · Avisos: sonner
- [x] Testes: Vitest (`bunx vitest run`)

## 2. Modelo de dados
- [x] `Front`: id, priority (P0/P1/P2), name, objective, justification, okrObjective, expected, initiatives, dependencies, risks, completion, krs[], kpi, plan{nov, dec, close}
- [x] `KeyResult`: id (`<meta>-krN`), text
- [x] `Kpi`: name, formula, baseline, target, frequency, owner
- [x] `CustomFront` = Front + quarter
- [x] Estado salvo: `kr` (% por KR), `kpiValue`, `notes`, `summary`, `summaries` (por quarter), `activeQuarter`, `quarters`, `customFronts`, `dueDates` (metas e KRs), `closedDates` (metas e KRs)

## 3. Conteúdo pré-carregado (Q4/2026)
- [x] P0: Agente Uau (uau), Orquestração de Agentes (orq), Contexto de Usuário (ctx), Governança (gov)
- [x] P1: WhatsApp (wpp) · P2: B2B (b2b), Plataforma (plat)

## 4. Telas
### 4.1 Dashboard `/`
- [x] Anel de progresso geral ponderado + P0 vs P1/P2
- [x] Cartão por meta: prioridade, %, barra, status, KRs
- [x] Cartões de KPI: meta, valor atual, %, área de notas
- [x] Filtro por prioridade, gráfico de barras por meta
### 4.2 Metas `/metas`
- [x] Detalhes da meta (objetivo, justificativa, riscos, dependências, critério de conclusão)
- [x] KR com controle de % (0–100)
- [x] Data estimada e fechamento por meta e por KR, com calendário e selo de status/dias restantes
- [x] Aviso de KR além do prazo da meta (diminuir / ampliar meta)
### 4.3 KPIs & OKRs `/kpis`
- [x] Ficha do KPI, OKRs vinculados, valor atual, notas, completude da meta e progresso geral
### 4.4 Relatório `/relatorio`
- [x] Resumo executivo editável por quarter
- [x] % por meta, KRs concluídos/pendentes, datas editáveis (mesmas regras de Metas)
- [x] Exportar PDF `relatorio-<quarter>-ia-agentica-AAAA-MM-DD.pdf` com colunas Estimada/Fechamento/Status
### 4.5 Nova meta `/nova-meta`
- [x] Formulário: quarter, prioridade, nome, textos, KRs dinâmicos, KPI, plano
### 4.6 Histórico `/historico`
- [x] Metas concluídas por quarter com datas
- [x] Exportar backup `historico-<quarter>-AAAA-MM-DD.json` e importar com validação
### 4.7 Cabeçalho comum
- [x] Navegação com item ativo destacado, seletor de quarter, botão Carregar dados

## 5. Regras (fonte e teste)
| Regra | Fonte | Teste |
|---|---|---|
| % meta = média dos KRs; geral P0 80% / P1+P2 20% | `src/lib/progress.ts` | `progress.test.ts` |
| Limite do KR pela meta pai e ampliação confirmada | `src/lib/due-policy.ts` | `due-policy.test.ts` |
| Dias restantes / atraso | `src/lib/due.ts` | `due.test.ts` |
| Adiantado / no prazo / com atraso; auto-fechamento | `src/lib/closure.ts` | `closure.test.ts` |
| Validação de backup | `src/lib/backup.ts` | `backup.test.ts` |
| Datas no PDF | `src/lib/report-pdf.ts` | `report-pdf.test.ts` |
| Arquivo local e recuperação | `local-history-file.ts`, `src/lib/local-file-sync.ts` | `local-history-file.test.ts`, `local-file-sync.test.ts` |

## 6. Persistência local
- [x] Endpoint de desenvolvimento `/__local-data` (GET/PUT) via plugin Vite
- [x] Prioriza `data/historico.json.local`, aceita `data/historico.json`, recupera cópias `*preservado*`
- [x] Gravação atômica; autosave só após leitura bem-sucedida; pausa durante recuperação manual
- [x] Nunca grava estado vazio na inicialização sem arquivo

## 7. Requisitos não funcionais
- [x] Interface pt-BR, responsiva (sem rolagem horizontal em 390px)
- [x] Metadados próprios por tela (título, descrição, og)
- [x] Funciona sem backend e sem créditos
- [ ] Multiusuário / login / nuvem
- [ ] Alertas de prazo
