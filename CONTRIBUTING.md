# Contribuindo com a Omni

Obrigado por querer melhorar a Omni Business Platform. Este guia ajuda a manter
o produto seguro, consistente e fácil de evoluir.

## Antes de começar

- Leia a [arquitetura](docs/ARCHITECTURE.md), a [política de segurança](docs/SECURITY.md)
  e o [guia operacional](docs/OPERATIONS.md).
- Abra uma issue ou alinhe a proposta com os mantenedores antes de iniciar uma
  alteração grande.
- Não envie credenciais, arquivos `.env`, dados reais de clientes ou informações
  fiscais/reguladas para o repositório.

## Ambiente local

São necessários Node.js 20.9+ e npm 11+.

```bash
npm install
npm run dev:web
npm run dev:api
```

Veja o [README](README.md) para configurar banco local, Prisma e variáveis de
ambiente.

## Fluxo de contribuição

1. Crie uma branch curta a partir da `main`.
2. Faça uma alteração coesa e documente decisões que afetem arquitetura,
   segurança ou operação.
3. Inclua testes proporcionais ao risco e atualize a documentação quando a
   experiência de uso ou a operação mudar.
4. Execute antes de abrir o pull request:

   ```bash
   npm run build
   npm run lint --workspace=@omni/web
   npm test
   ```

5. Abra um pull request com contexto, impacto, evidências de teste e plano de
   reversão quando aplicável.

## Padrões técnicos

- Mantenha módulos de negócio isolados e exponha somente contratos públicos.
- Valide entradas, aplique autorização por organização e registre auditoria em
  operações sensíveis.
- Evite dependências desnecessárias, duplicação e mudanças amplas sem motivo.
- Preserve compatibilidade de API ou documente uma migração versionada.
- Nunca reduza controles de segurança apenas para fazer um teste passar.

## Reportando segurança

Não abra issue pública para uma vulnerabilidade. Siga a
[política de segurança](docs/SECURITY.md).
