# Operação da API

## Fonte de verdade

O token OIDC prova a identidade (`sub`). A associação entre pessoa, organização,
permissões e `subscription_status` é consultada no PostgreSQL a cada requisição
autenticada. Assim, trocar de plano, revogar um membro ou cancelar uma assinatura
produz efeito sem depender de um token antigo.

## Prisma e banco local

```bash
docker compose up -d
Copy-Item apps/api/.env.example apps/api/.env
npm run db:migrate --workspace=@omni/api
npm run prisma:generate --workspace=@omni/api
npm run dev:api
```

As migrações SQL em `database/migrations` são a fonte de versionamento do schema;
o Prisma fornece cliente tipado e repositórios, não duas ferramentas concorrendo
para alterar o banco. `db:migrate` registra cada arquivo em `schema_migrations`
e só executa os ainda pendentes. Em produção, execute esse comando uma vez em
pipeline com uma conta de migração, antes de publicar a API.

O Docker Compose não aplica SQL automaticamente: isso evita que um volume local
existente fique com tabelas criadas sem histórico de versões. Para um banco local
novo, suba os containers e execute `db:migrate`. Para um banco anterior, faça
backup e registre um baseline deliberadamente antes de aplicar migrações novas;
não apague dados para "forçar" uma atualização.

## Papel de banco e isolamento

Use uma conta de migração separada da conta da aplicação. A conta da aplicação
não pode ter `BYPASSRLS`, `SUPERUSER`, `CREATEDB` nem propriedade das tabelas.
Cada operação de tenant abre transação e executa `set_config` localmente antes de
ler ou gravar. Isso evita vazamento entre organizações mesmo se um filtro da
aplicação for omitido.

## Webhook de cobrança

Endpoint público:

```text
POST /v1/webhooks/billing
```

O corpo é o JSON bruto e o cabeçalho configurável `x-omni-signature` deve conter
`sha256=<HMAC_SHA256_HEX_DO_CORPO>`. O contrato genérico espera:

```json
{
  "id": "evt_123",
  "type": "payment.approved",
  "data": {
    "organization_id": "uuid-da-organizacao",
    "customer_id": "cus_123",
    "subscription_id": "sub_123",
    "current_period_end": "2026-09-15T00:00:00.000Z"
  }
}
```

Eventos aceitos: `payment.approved`, `payment.failed`,
`subscription.activated`, `subscription.past_due` e `subscription.cancelled`.
O identificador do evento é único; reenvios retornam sucesso sem duplicar a
alteração. Cada provedor real (Stripe, Mercado Pago, Asaas etc.) deve ter um
adaptador que valide o esquema e a assinatura próprios e então converta para esse
contrato interno. Nunca reutilize o segredo de um provedor em outro.

## InfinitePay

Para a assinatura Omni de R$ 49,90, configure no ambiente **somente da API**:

```text
INFINITEPAY_HANDLE=sua_infinite_tag_sem_o_cifrao
INFINITEPAY_WEBHOOK_URL=https://api.seudominio.com/v1/webhooks/infinitepay
INFINITEPAY_REDIRECT_URL=https://www.seudominio.com/pagamento
```

O endpoint autenticado `POST /v1/billing/infinitepay/checkout` cria um link de
checkout, vinculado a uma organização, e responde com `checkoutUrl`. Ele envia à
InfinitePay o valor de 4.990 centavos, uma `order_nsu` opaca e as URLs acima.

A URL pública da InfinitePay é `POST /v1/webhooks/infinitepay`. Ela não libera a
conta apenas pelo corpo recebido: localiza a sessão criada, confere o valor e faz
uma consulta servidor-a-servidor em `POST /payment_check`. Somente uma resposta
`paid: true` com o valor exato atualiza a assinatura para `active`. O
`transaction_nsu` é único, então reenvios são idempotentes.

A documentação pública atual do checkout não descreve assinatura criptográfica
para o webhook. Por isso, não configure `BILLING_WEBHOOK_SECRET` como se ele
protegesse esse endpoint; a confirmação em `payment_check` é a barreira de
segurança desta integração. Guarde `INFINITEPAY_HANDLE` e os identificadores de
transação como dados operacionais e jamais no frontend.

## Fiscal e setores regulados

O sistema ainda não transmite documentos fiscais, receitas ou dados regulados.
Antes de ativar essa etapa, escolha e contrate parceiros homologados, obtenha
certificados e credenciais de produção, valide UF/município e implemente um
adaptador por parceiro com fila, idempotência, cofre de segredos e trilha de
auditoria. A interface de um fornecedor não é homologação fiscal.

## Produção na Vercel

A Vercel pode hospedar `apps/web`. A API Fastify e o PostgreSQL devem ficar em
serviços com execução de servidor e rede privada apropriadas. Configure
`DATABASE_URL`, OIDC e `BILLING_WEBHOOK_SECRET` apenas no ambiente da API, nunca
em variáveis `NEXT_PUBLIC_*`. O webhook deve usar domínio estável HTTPS e a URL
de produção da API.
