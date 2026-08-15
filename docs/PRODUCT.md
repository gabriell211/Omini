# Omni Business Platform

Uma plataforma SaaS B2B multiempresa, multiunidade e multivertical. Ela une
capacidades comuns (identidade, cobrança, financeiro, auditoria e integrações)
com domínios de negócio isolados. Um cliente só habilita os verticais que usa.

## Verticais iniciais

| Vertical | Fluxos essenciais | Módulos próprios |
| --- | --- | --- |
| Restaurante | salão, retirada, entrega, caixa, produção | mesas/comandas, cardápio, KDS, ficha técnica, delivery, reservas, desperdício |
| Supermercado | compra, recebimento, venda e ruptura | PDV, balança/etiquetas, estoque por loja, preço/promoção, perdas, atacado, fidelidade |
| Farmácia | venda controlada, compra, dispensação e conveniado | lotes/validade, SNGPC via conector homologado, PBM/convênios, receitas, temperatura, recall |
| Advocacia | captação, caso, prazo, documento e faturamento | clientes/processos, agenda de prazos, timesheet, honorários, cofre documental, portal do cliente |
| Beleza e bem-estar | descoberta, agenda, atendimento e comissão | agenda, profissionais, pacotes, comissões, prontuário com consentimento, recorrência |
| Serviços em campo | orçamento, agenda, execução e cobrança | ordens de serviço, roteirização, checklists, fotos, contratos, assinaturas |
| Varejo e comércio | catálogo, canais, estoque e pedidos | PDV, e-commerce, OMS, catálogo, estoque, promoções, CRM/fidelidade |
| Franquias | governança de rede e consolidação | franqueadora/unidades, royalties, padrões, indicadores, repasses e auditoria |
| Veterinária | recepção, consulta, tratamento e retorno | tutor/paciente, agenda, prontuário, prescrição, vacinação, exames, internação, estoque, cobrança e portal |
| Oficina mecânica | entrada, diagnóstico, reparo e entrega | veículo/histórico, OS, inspeção digital, orçamento/aprovação, peças, boxes, apontamento técnico, faturamento e pós-venda |
| Materiais de construção | orçamento, venda, separação e entrega | PDV, preço por cliente/obra, estoque por pátio, compras, pedido especial, corte/fracionamento, carga, rota e contas a receber |
| Loja de carros | captação, negociação, venda e pós-venda | estoque de veículos, avaliação/troca, CRM, proposta, financiamento, documentação, entrega, garantia e serviços |

Os verticais adicionais foram priorizados por sinais de demanda no Brasil:
comércio e serviços representam 82,2% das empresas ativas; saúde, beleza e
bem-estar, alimentação/distribuição e limpeza/conservação foram destaques de
crescimento no franchising. Fontes: [Mapa de Empresas](https://www.gov.br/memp/pt-br/assuntos/noticias/abertura-de-empresas-cresce-14-1-no-2o-quadrimestre-de-2025-no-brasil) e [ABF](https://abf.com.br/numeros-do-franchising/).

## Núcleo compartilhado

- Organização, unidades, usuários, RBAC e permissões por vertical.
- Assinatura SaaS, planos, uso, invoices, cobrança recorrente, inadimplência e webhooks de pagamento.
- Financeiro operacional: contas a pagar/receber, caixa, conciliação, centros de custo e DRE. O livro contábil e fiscal é extensível por país e regime tributário.
- Catálogo, pessoas/empresas, documentos, notificações, tarefas e relatórios.
- Auditoria imutável, exportação LGPD, retenção e integrações.

## Dois significados de faturamento

O produto separa explicitamente:

1. **Cobrança da plataforma:** assinatura, uso, invoice, pagamento e bloqueio por inadimplência.
2. **Faturamento do cliente:** venda, contas a receber e documento fiscal.

NFC-e, NF-e, NFS-e, SAT/CF-e, TEF, SNGPC e PBM não serão implementados como
regras genéricas. Cada um terá adaptador certificado/homologado, seleção por UF
e contingência. Isso reduz risco regulatório e evita emitir documentos inválidos.
