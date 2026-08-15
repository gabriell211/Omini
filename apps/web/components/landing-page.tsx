import Link from "next/link";
import { Icon } from "./icon";
import { Logo } from "./logo";

const capabilities = [
  ["Restaurante", "Comandas, cozinha, delivery e caixa", "restaurant"],
  ["Supermercado", "PDV, estoque, promoções e compras", "store"],
  ["Farmácia", "Lotes, validade e controle regulatório", "pill"],
  ["Advocacia", "Casos, prazos, documentos e honorários", "legal"],
  ["Veterinária", "Agenda, prontuários e vacinação", "paw"],
  ["Oficina", "OS, inspeções e peças", "wrench"],
  ["Materiais", "Orçamentos, pátio e entregas", "bricks"],
  ["Veículos", "Estoque, CRM e propostas", "car"]
] as const;

export function LandingPage() {
  return <main className="landing">
    <header className="landing-header">
      <Link href="/landing" aria-label="Omni, início"><Logo /></Link>
      <nav aria-label="Navegação da landing"><a href="#sistemas">Sistemas</a><a href="#beneficios">Por que Omni</a><a href="#preco">Planos</a></nav>
      <Link className="landing-login" href="/home">Entrar <Icon name="arrow-right" size={15} /></Link>
    </header>

    <section className="landing-hero">
      <div className="landing-glow" aria-hidden="true" />
      <p className="landing-kicker"><i /> OPERAÇÃO CONECTADA, DADOS PROTEGIDOS</p>
      <h1>Seu negócio não cabe<br />em uma planilha.</h1>
      <p className="landing-lead">A Omni reúne sistemas especializados em uma plataforma clara, segura e preparada para a rotina real da sua empresa.</p>
      <div className="landing-cta"><Link href="/cadastro" className="landing-primary">Começar agora <Icon name="arrow-right" size={18} /></Link><span>R$ 49,90 por mês</span></div>
      <div className="landing-preview" aria-label="Prévia do painel Omni">
        <div className="preview-nav"><span className="preview-logo"><Logo compact inverse /></span><i /><i /><i /></div>
        <div className="preview-body"><aside><span /><span className="active" /><span /><span /><span /></aside><section><div className="preview-title"><span /><span /></div><div className="preview-metrics"><i /><i /><i /></div><div className="preview-content"><i /><i /></div></section></div>
      </div>
    </section>

    <section className="landing-systems" id="sistemas"><div className="landing-section-head"><p>UM NÚCLEO, VÁRIAS OPERAÇÕES</p><h2>O sistema certo para cada tipo de negócio.</h2><span>Ative apenas o que sua empresa utiliza. Os dados permanecem isolados por organização e por módulo.</span></div><div className="landing-capability-grid">{capabilities.map(([title, description, icon]) => <article key={title}><span><Icon name={icon} size={21} /></span><h3>{title}</h3><p>{description}</p><Icon name="arrow-right" size={16} /></article>)}</div></section>

    <section className="landing-benefits" id="beneficios"><div><p>FEITO PARA QUEM OPERA</p><h2>Menos troca de tela.<br />Mais decisão no tempo certo.</h2></div><div className="benefit-list"><article><strong>01</strong><div><h3>Contexto no lugar certo</h3><p>Unidade, equipe e operação visíveis em cada ação, sem misturar empresas ou fluxos.</p></div></article><article><strong>02</strong><div><h3>Segurança nativa</h3><p>Permissões granulares, auditoria e isolamento de dados desde o primeiro acesso.</p></div></article><article><strong>03</strong><div><h3>Pronto para crescer</h3><p>Novas unidades e sistemas entram sem obrigar sua operação a recomeçar.</p></div></article></div></section>

    <section className="landing-pricing" id="preco"><div className="pricing-intro"><p>PREÇO SIMPLES</p><h2>Comece leve.<br />Cresça com confiança.</h2><span>Sem contratos longos e sem uma plataforma complicada para aprender.</span></div><article className="pricing-card"><p>PLANO OMNI</p><strong><small>R$</small> 49<span>,90</span></strong><em>por mês</em><ul><li><Icon name="plus" size={15} /> Acesso à plataforma Omni</li><li><Icon name="plus" size={15} /> Sistemas conforme sua operação</li><li><Icon name="plus" size={15} /> Painel e relatórios essenciais</li><li><Icon name="plus" size={15} /> Segurança e atualizações contínuas</li></ul><Link href="/cadastro" className="landing-primary full">Criar minha operação <Icon name="arrow-right" size={18} /></Link></article></section>

    <footer className="landing-footer"><Logo inverse /><span>© 2026 Omni Business Platform</span><Link href="/home">Acessar plataforma <Icon name="arrow-right" size={14} /></Link></footer>
  </main>;
}
