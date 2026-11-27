# PRD — Metas em Foco (Metas Q4/2026 · IA Agêntica)

## 1. Visão geral
Aplicativo web de uso individual para acompanhar o plano de metas da área de IA Agêntica: metas (frentes), Key Results (OKRs), KPIs, prazos, fechamentos, anotações e relatório final em PDF. Vem pré-carregado com o plano Q4/2026 e permite cadastrar novas metas para outros quarters (ex.: Q1/2027).

## 2. Problema
O plano existia apenas em documento estático, sem medir completude, prazos nem gerar relatório. O gestor precisa enxergar rapidamente o andamento de cada meta e o progresso geral, registrar observações e exportar um relatório executivo.

## 3. Usuário-alvo
- **Gestor da área (Marcu Loreto)** — único usuário; atualiza percentuais, datas e notas e gera relatórios.
- **Leitores do relatório** (liderança/stakeholders) — consomem o PDF exportado.

## 4. Objetivos
1. Mostrar o % de completude por meta e geral, calculado automaticamente a partir dos KRs.
2. Listar KPIs e os OKRs vinculados a cada KPI.
3. Controlar prazos estimados e datas reais de fechamento de metas e KRs.
4. Gerar relatório final em PDF com data no nome do arquivo.
5. Manter histórico por quarter, com backup e recuperação dos dados.

## 5. Fora de escopo (versão atual)
- Login, múltiplos usuários ou permissões.
- Banco de dados em nuvem / sincronização entre dispositivos automática.
- Notificações por e-mail ou integrações externas.

## 6. Funcionalidades
| # | Funcionalidade | Descrição |
|---|---|---|
| F1 | Dashboard | Anel de progresso geral, divisão P0 vs P1/P2, cartões por meta (%, barra, status, KRs), cartões de KPI com valor atual e notas, filtro por prioridade e gráfico de barras. |
| F2 | Metas | Lista de metas com objetivo, justificativa, riscos, dependências; cada KR com controle de %, data estimada e data de fechamento. |
| F3 | KPIs & OKRs | Tabela de KPIs (fórmula, baseline, meta, frequência, responsável), OKRs vinculados, valor atual, notas e completude da meta. |
| F4 | Relatório final | Resumo executivo editável, % por meta, KRs concluídos/pendentes, prazos, KPIs, notas; exportação PDF. |
| F5 | Nova meta | Cadastro de metas, KRs e KPI para qualquer quarter. |
| F6 | Histórico | Metas concluídas por quarter; exportar/importar backup JSON. |
| F7 | Seletor de quarter | Alterna o quarter ativo em todas as telas. |
| F8 | Carregar dados | Botão no topo de todas as telas para recarregar o histórico salvo ou escolher um arquivo JSON. |

## 7. Regras de negócio
- **Completude da meta** = média simples dos % dos seus KRs.
- **Progresso geral** = metas P0 somam 80% do peso; P1+P2 somam 20% (divididos igualmente dentro de cada grupo).
- **Status por ritmo**: compara % com o tempo decorrido do quarter — No prazo (≥ decorrido −10), Atenção (≥ −25), Em risco (abaixo), Concluído (100%).
- **Prazos**: nenhum KR pode ter data estimada maior que a da meta pai. Se o usuário tentar, aparece um aviso com duas opções: diminuir a data do KR ou ampliar o prazo da meta e do KR (a meta passa a ter a nova data). A meta não pode ter prazo anterior ao KR mais tardio.
- **Fechamento**: cada meta e KR tem data estimada e data de fechamento. Status: Adiantado (antes), Fechada no prazo (igual), Fechada com atraso (depois), Atrasada N dias (aberta e vencida), dias restantes (aberta e no prazo).
- KR que chega a 100% registra a data de hoje como fechamento; voltar abaixo de 100% apaga o fechamento.
- Fechar a meta manualmente marca todos os KRs como 100% (pede confirmação se houver KRs em andamento).
- A meta fecha automaticamente quando todos os KRs têm fechamento, usando a data mais recente.

## 8. Dados e armazenamento
- Plano Q4/2026 fixo no código; metas de outros quarters criadas pelo usuário.
- Progresso, notas, datas e resumos salvos no navegador.
- Rodando localmente, também gravados em `data/historico.json.local` (compatível com `data/historico.json`), com recuperação de cópias preservadas.
- Backup/restauração via arquivo JSON validado.

## 9. Design
Fundo cinza-quente, cartões brancos, verde sálvia como cor principal, texto quase preto, fonte DM Sans, cantos arredondados e sombras leves. Interface em português do Brasil, adaptada a celular.

## 10. Métricas de sucesso
- Relatório PDF gerado sem edição manual.
- 100% das metas e KRs com prazo estimado definido.
- Nenhuma perda de dados entre sessões (verificável pelo botão Carregar dados).

## 11. Evoluções futuras
- Lovable Cloud para login e dados em nuvem multi-dispositivo.
- Compartilhamento do painel com leitura para stakeholders.
- Alertas de prazos próximos.
