# Cobertura competitiva por vertical

Esta matriz é um contrato de produto: cada item marcado como essencial entra no
escopo da vertical, mesmo que a entrega ocorra em ondas. Não se deve vender uma
vertical regulada antes de seus controles obrigatórios estarem homologados.

| Vertical | Referências consultadas | Capacidades essenciais | Diferencial Omni |
| --- | --- | --- | --- |
| Restaurante | Toast | PDV, mesas/comandas, KDS, retirada/delivery, pedido online, pagamentos, cardápio, estoque/custo, reservas, marketing/fidelidade, escala/equipe, multiunidade e offline | Uma única visão conecta salão, cozinha, caixa e margem em tempo real; filas e alertas priorizam o turno atual em vez de apenas relatórios históricos. |
| Supermercado | SysPDV | PDV/self-checkout, fiscal, compras, estoque, balança, TEF, atacarejo, preço programado, promoções, crédito, produtividade de operador e relatórios | Motor único de preço/promoção com simulação de margem e alertas de ruptura/validade por loja. |
| Farmácia | SNGPC/Innove/Anvisa | PDV, lote e validade, entrada/venda/perda, receita, inventário, validação e transmissão SNGPC, convênios/PBM, fiscal e recall | Fluxo à prova de erro: bloqueio de lote não validado, pré-validação, pendências claras e trilha auditável; conectores regulatórios isolados. |
| Advocacia | Clio | intake/CRM, casos, agenda/prazos, tarefas, documentos, timesheet, despesas, faturamento, conta de confiança, pagamentos, portal e automação | Dados e IA com segregação de caso/cliente, citações verificáveis e nenhuma exposição de documentos sigilosos sem permissão explícita. |
| Beleza e bem-estar | Fresha | agenda, recursos/salas, reservas online, confirmação/lembrete, depósito/no-show, CRM, consentimento, POS, estoque, comissão, pacotes, assinatura, gift card e relatórios | Jornada local: Pix, WhatsApp, comissão e consentimento reunidos sem transformar o cliente em um marketplace obrigatório. |
| Serviços em campo | Jobber | orçamento, CRM, OS, agenda, despacho, rotas, checklists/fotos, portal, recorrência, invoice/pagamento e rentabilidade | Técnico recebe trabalho offline-first, registra evidências e coleta assinatura; gestor enxerga SLA, rota e margem da OS. |
| Varejo omnichannel | VTEX | catálogo, preço, estoque, OMS, marketplace, loja física, BOPIS, ship-from-store, devolução e B2B | Estoque prometível por canal e regra de fulfillment visível para operador e cliente, sem conciliação manual. |
| Franquias | FranConnect | implantação de unidade, vendas, auditorias, ação corretiva, treinamento, suporte, benchmarks, royalties, cobrança, BI e integrações | Cada franqueado recebe contexto da unidade; a franqueadora acompanha exceções, não precisa vasculhar dezenas de painéis. |
| Veterinária | ezyVet | tutor e paciente, agenda/portal, prontuário clínico, prescrição, vacinação/lembretes, anexos, internação/hospedagem, estoque, compras, cobrança automática, comunicação e relatórios | O atendimento conecta consulta, prescrição, consumo de insumos e cobrança, reduzindo lançamentos esquecidos; permissões separam recepção, clínica e gestão. |
| Oficina mecânica | Tekmetric | agendamento, cliente/veículo, OS, inspeção digital com foto/vídeo, orçamento, aprovação remota, mão de obra, peças, pneus, boxes, comunicação, invoice/pagamento, retorno e métricas | A OS é a fonte de verdade: inspeção, orçamento, aprovação, pedido de peça, apontamento e garantia ficam ligados e auditáveis. |
| Materiais de construção | ECI Spruce | PDV, orçamento, preço por cliente/empreiteiro, pedido especial, catálogo do fornecedor/EDI, compras, estoque por pátio/filial, margem, contas, e-commerce e entrega | Venda orientada à obra: reserva de estoque, preço por contrato, fracionamento e carga/rota vinculados à mesma venda. |
| Loja de carros | DealerSocket | CRM, leads, estoque e precificação de veículo, avaliação/troca, proposta, cenários de pagamento/financiamento, DMS, documentação, serviço, marketing e análise | Funil com origem do lead, proposta comparável e histórico completo de veículo/cliente; regras de aprovação preservam margem e rastreiam alterações. |

## Ordem de implementação recomendada

1. Restaurante: PDV/comandas/KDS/caixa/estoque e pedidos digitais.
2. Supermercado: PDV, preço, estoque, compras, fiscal e equipamentos.
3. Beleza e serviços em campo: aproveitam agenda, CRM, pagamento e financeiro já existentes.
4. Advocacia: cofre documental, prazo e faturamento após reforço de governança de dados.
5. Veterinária e oficina: aproveitam agenda, estoque, OS, anexos e faturamento; implementar seus núcleos clínico e técnico sem compartilhar dados sensíveis.
6. Materiais de construção e loja de carros: entram após maturidade de preço por regra, compras, logística e CRM.
7. Farmácia: somente com responsável técnico e validação formal do conector SNGPC/PBM.
8. Varejo omnichannel e franquias: após estabilizar catálogo, OMS e multiunidade.

## Fontes primárias

- [Toast — restaurante](https://pos.toasttab.com/restaurant-pos)
- [SysPDV — supermercado](https://syspdv.com.br/)
- [Anvisa — SNGPC](https://www.gov.br/anvisa/pt-br/assuntos/fiscalizacao-e-monitoramento/sngpc)
- [Innove SNGPC](https://www.sngpc.innovesistemas.com.br/)
- [Clio — advocacia](https://www.clio.com/features/)
- [Fresha — beleza e bem-estar](https://www.fresha.com/for-business/features)
- [Jobber — serviços em campo](https://www.getjobber.com/features/)
- [VTEX — omnichannel](https://www.vtex.com/en-us/solutions/business-needs/b2c-omnichannel/)
- [FranConnect — franquias](https://www.franconnect.com/en/franconnect-home/)
- [ezyVet — veterinária](https://www.ezyvet.com/veterinary-practice-management-software)
- [Tekmetric — oficina](https://www.tekmetric.com/feature/shop-management)
- [ECI Spruce — materiais de construção](https://www.ecisolutions.com/products/building-materials-software/)
- [DealerSocket — loja de carros](https://dealersocket.com/products/)
