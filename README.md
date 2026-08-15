# Omni Business Platform

Plataforma SaaS multiempresa para operações brasileiras. A Omni oferece núcleos
compartilhados de identidade, faturamento, auditoria e financeiro, com verticais
isolados para cada tipo de negócio.

> Status: fundação de produto e frontend operacional em desenvolvimento.

## O que já está incluído

- Jornada pública: splash animada → landing → cadastro → checkout → home.
- Plano mensal configurado em **R$ 49,90/mês**.
- Seleção de módulos durante o cadastro.
- Bloqueio de acesso no frontend e na API até a assinatura estar ativa.
- Dashboard principal e telas operacionais para Restaurante, Veterinária,
  Oficina, Materiais de Construção e Loja de Carros.
- Contratos TypeScript compartilhados, RBAC, JWT/OIDC, auditoria e isolamento
  de tenant planejado com PostgreSQL Row-Level Security.

## Verticais de negócio

| Operação | Capacidades planejadas |
| --- | --- |
| Restaurante | PDV, mesas, comandas, KDS, delivery, caixa e estoque |
| Supermercado | PDV, preço, promoções, compras, fiscal e estoque |
| Farmácia | Lotes, validade, receita, SNGPC/PBM e dispensação |
| Advocacia | Casos, prazos, documentos, horas e honorários |
| Veterinária | Agenda, prontuário, vacinação, internação e estoque clínico |
| Oficina | OS, inspeção digital, orçamento, peças e boxes |
| Materiais de construção | Orçamento, preço por obra, pátio, carga e entrega |
| Loja de carros | CRM, estoque, avaliação, proposta e pós-venda |
| Outros | Beleza, serviços em campo, varejo omnichannel e franquias |

## Arquitetura

```text
apps/web        Next.js + React: landing, cadastro e painéis operacionais
apps/api        Fastify: autenticação, contexto de tenant e regras de acesso
packages/       Contratos TypeScript compartilhados
database/       Migrações PostgreSQL e políticas de isolamento
docs/           Produto, segurança, arquitetura e cobertura competitiva
```

O produto começa como um **monólito modular**: os módulos compartilham apenas
contratos públicos e eventos, nunca tabelas ou regras internas. Isso reduz a
complexidade inicial sem impedir extrações futuras quando um domínio precisar
escalar de forma independente.

## Requisitos

- Node.js 20.9 ou superior
- npm 11 ou superior
- Docker Desktop (opcional, para PostgreSQL e Redis locais)

## Desenvolvimento local

```bash
npm install
npm run dev:web
```

Abra `http://localhost:3000`. A splash encaminha automaticamente para a landing.

Para executar a API, copie `apps/api/.env.example` para `apps/api/.env`, preencha
as configurações de OIDC e rode:

```bash
npm run dev:api
```

Infraestrutura local opcional:

```bash
docker compose up -d
```

## Qualidade

```bash
npm run build
npm test
npm run lint --workspace=@omni/web
```

## Assinatura e pagamento

A home e os módulos exigem assinatura com estado `active`. A interface nunca
libera acesso por uma ação local; o estado deve ser confirmado pelo backend após
um webhook assinado do provedor de pagamento.

Para conectar um checkout hospedado, configure em produção:

```text
NEXT_PUBLIC_BILLING_CHECKOUT_URL=https://checkout-do-seu-provedor
```

O provedor deve enviar a confirmação para uma rota pública da API, por exemplo:

```text
https://api.seudominio.com/v1/webhooks/pagamento
```

> Nunca confie somente no redirecionamento do navegador como prova de pagamento.
> A assinatura deve ser ativada apenas depois da validação criptográfica do
> webhook e refletida no `subscription_status` do token do usuário.

## Publicação na Vercel

1. Importe este repositório na Vercel.
2. Defina **Root Directory** como `apps/web`.
3. Use Node.js 20.9+.
4. Configure as variáveis de ambiente de produção, incluindo a URL do checkout.
5. Publique usando o domínio de produção estável — não uma URL de preview.

O webhook de pagamento precisa de uma API pública. A API Fastify deve ser
implantada em um serviço de containers/serverless compatível ou migrada para uma
Route Handler do Next.js com validação de assinatura do provedor escolhido.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Produto e verticais](docs/PRODUCT.md)
- [Cobertura competitiva](docs/COMPETITIVE-COVERAGE.md)
- [Segurança](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)

## Próximos marcos

1. Autenticação real, banco persistente e criação de organizações.
2. Integração de pagamento, webhook assinado e emissão de `subscription_status`.
3. CRUDs e regras de domínio para Restaurante e Supermercado.
4. Integrações fiscais e reguladas com parceiros homologados.
5. Observabilidade, deploy contínuo e testes E2E.

## Contribuição

Leia os documentos de arquitetura e segurança antes de adicionar um vertical.
Todo novo módulo deve ter validação de entrada, autorização, auditoria,
telemetria, migração e testes proporcionais ao risco.
