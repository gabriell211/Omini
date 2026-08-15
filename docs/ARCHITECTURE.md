# Arquitetura técnica

## Stack escolhida

- **Web:** Next.js + React + TypeScript, Server Components onde aplicável e TanStack Query para estados remotos.
- **API:** Node.js LTS + Fastify + TypeScript em modo estrito. Fastify oferece bom desempenho e um núcleo HTTP pequeno; a arquitetura interna não depende dele.
- **Dados:** PostgreSQL, com Row-Level Security para isolamento de tenant; Redis para rate limit, filas e cache efêmero; S3 compatível para arquivos.
- **Contratos:** TypeScript compartilhado, OpenAPI gerado e schemas Zod na borda da API. Tipos não substituem validação de payload externo.
- **Assíncrono:** transactional outbox + worker de filas. Todo consumidor é idempotente.
- **Operação:** containers, OpenTelemetry, logs JSON, métricas e alertas. CI executa typecheck, testes, análise de dependências e migrações efêmeras.

## Fronteiras

```text
apps/web ── HTTPS ──> apps/api (BFF/API)
                         │
              ┌──────────┴──────────┐
              │ shared kernel        │
              │ identity, tenancy,   │
              │ billing, audit       │
              └──────────┬──────────┘
       restaurant supermarket pharmacy legal ...
              │      │        │       │
        PostgreSQL schemas / RLS + outbox events
```

Cada módulo possui `domain`, `application`, `infrastructure` e `transport`.
Um módulo só acessa outro por comando, consulta publicada ou evento versionado;
nunca importa tabelas ou classes internas. O início como monólito modular reduz
custo operacional. Um módulo pode ser extraído após pressão real de escala,
mantendo seu contrato de eventos.

## Isolamento e autorização

O ID da organização vem de uma associação verificada no token, e não apenas de
um cabeçalho. Em toda transação, a API executará `SET LOCAL
app.current_organization_id = :organizationId`; as tabelas com dados de tenant
terão RLS. Assim, uma falha de filtro na aplicação não expõe registros de outra
empresa. O usuário recebe a menor permissão possível e ações sensíveis exigem
permissão explícita e são auditadas.
