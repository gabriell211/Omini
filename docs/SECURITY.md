# Segurança e conformidade desde o início

- OIDC/OAuth 2.1 com PKCE; tokens curtos, rotação de chaves e validação de emissor, público e assinatura.
- RBAC com permissões granulares; MFA obrigatório para administradores e operações de alto risco.
- RLS no PostgreSQL, criptografia em trânsito e em repouso, backups testados e segregação de ambientes.
- Segredos apenas em cofre; nunca no repositório, logs ou eventos.
- Rate limit por IP, usuário e organização; WAF, limites de upload, varredura antimalware e URLs assinadas para arquivos.
- Dados pessoais classificados, minimizados e com exportação/eliminação LGPD; farmacêutico e advocacia têm políticas de retenção próprias.
- Audit log append-only para alterações de preço, estoque, caixa, documentos, permissões e faturamento.
- SAST, dependências bloqueadas por vulnerabilidade crítica, DAST em homologação e revisão de ameaças por vertical.

Dados clínicos, receitas, processos e documentos de clientes nunca devem entrar em ferramentas de análise, suporte ou IA sem consentimento e controles específicos.
