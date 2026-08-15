"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import { Icon, type IconName } from "./icon";
import { Logo } from "./logo";

type Module = { readonly label: string; readonly icon: IconName; readonly description: string };

const modules: readonly Module[] = [
  { label: "Visão geral", icon: "home", description: "Painel da operação" },
  { label: "Restaurante", icon: "restaurant", description: "Pedidos e cozinha" },
  { label: "Supermercado", icon: "store", description: "PDV e estoque" },
  { label: "Farmácia", icon: "pill", description: "Lotes e dispensação" },
  { label: "Advocacia", icon: "legal", description: "Casos e prazos" },
  { label: "Veterinária", icon: "paw", description: "Pacientes e prontuários" },
  { label: "Oficina", icon: "wrench", description: "Ordens e inspeções" },
  { label: "Materiais", icon: "bricks", description: "Orçamentos e entregas" },
  { label: "Veículos", icon: "car", description: "Estoque e propostas" }
];

const quickActions: readonly { readonly label: string; readonly icon: IconName; readonly tone: string }[] = [
  { label: "Novo pedido", icon: "plus", tone: "primary" },
  { label: "Abrir caixa", icon: "finance", tone: "plain" },
  { label: "Consultar estoque", icon: "store", tone: "plain" },
  { label: "Ver agenda", icon: "calendar", tone: "plain" }
];

export function DashboardShell() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("Visão geral");
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${navigationOpen ? "is-open" : ""}`} aria-label="Navegação principal">
        <div className="sidebar-top">
          <Logo inverse />
          <button className="icon-button only-mobile" type="button" aria-label="Fechar navegação" onClick={() => setNavigationOpen(false)}><Icon name="close" /></button>
        </div>
        <nav>
          <p className="nav-label">OPERAÇÃO</p>
          {modules.map((module) => (
            <button
              className={`nav-item ${activeModule === module.label ? "is-active" : ""}`}
              type="button"
              key={module.label}
              aria-current={activeModule === module.label ? "page" : undefined}
              onClick={() => {
                const routes: Record<string, Route> = { Restaurante: "/restaurante", Veterinária: "/veterinaria", Oficina: "/oficina", Materiais: "/materiais", Veículos: "/veiculos" };
                const route = routes[module.label];
                if (route) router.push(route); else setActiveModule(module.label);
                setNavigationOpen(false);
              }}
            >
              <Icon name={module.icon} size={19} />
              <span>{module.label}</span>
            </button>
          ))}
          <p className="nav-label spacing">ANÁLISE</p>
          <button className="nav-item" type="button"><Icon name="chart" size={19} /><span>Relatórios</span></button>
          <button className="nav-item" type="button"><Icon name="users" size={19} /><span>Clientes</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" type="button"><Icon name="settings" size={19} /><span>Configurações</span></button>
          <div className="user-card">
            <span className="avatar">GA</span>
            <span><strong>Gabriel Alves</strong><small>Administrador</small></span>
            <Icon name="more" size={18} />
          </div>
        </div>
      </aside>

      {navigationOpen && <button className="sidebar-backdrop" type="button" aria-label="Fechar menu" onClick={() => setNavigationOpen(false)} />}

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button only-mobile" type="button" aria-label="Abrir navegação" onClick={() => setNavigationOpen(true)}><Icon name="menu" /></button>
          <button className="organization-selector" type="button" aria-label="Selecionar organização">
            <span className="company-logo">O</span>
            <span><strong>Omni Demo</strong><small>Unidade Central</small></span>
            <Icon name="chevron-down" size={17} />
          </button>
          <div className="topbar-actions">
            <button className="search-button" type="button"><Icon name="search" size={19} /><span>Buscar ou pressionar <kbd>⌘ K</kbd></span></button>
            <button className="icon-button notification" type="button" aria-label="Notificações"><Icon name="bell" size={20} /><i /></button>
            <span className="avatar avatar-small">GA</span>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <p className="breadcrumb">Operação / <span>{activeModule}</span></p>
              <h1>Bom dia, Gabriel <span>✦</span></h1>
              <p>Terça-feira, 15 de agosto. Sua operação está sob controle.</p>
            </div>
            <button className="button button-primary" type="button"><Icon name="plus" size={18} /> Nova ação</button>
          </section>

          <section className="overview-grid" aria-label="Indicadores de hoje">
            <article className="metric-card primary-metric">
              <div className="metric-header"><span>Vendas hoje</span><button className="metric-menu" type="button" aria-label="Opções de vendas"><Icon name="more" size={19} /></button></div>
              <strong>R$ 18.450,00</strong>
              <p className="positive"><Icon name="arrow-up" size={15} /> 12,6% <span>comparado a ontem</span></p>
              <div className="mini-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="metric-card">
              <div className="metric-header"><span>Pedidos em andamento</span><span className="round-icon orange"><Icon name="restaurant" size={17} /></span></div>
              <strong>42</strong>
              <p>9 aguardando confirmação</p>
              <button className="text-link" type="button">Ver pedidos <Icon name="arrow-right" size={15} /></button>
            </article>
            <article className="metric-card">
              <div className="metric-header"><span>Caixa atual</span><span className="round-icon blue"><Icon name="finance" size={17} /></span></div>
              <strong>R$ 6.278,40</strong>
              <p>Aberto às 08:00 por Marina</p>
              <button className="text-link" type="button">Conferir caixa <Icon name="arrow-right" size={15} /></button>
            </article>
          </section>

          <section className="section-block">
            <div className="section-header"><div><h2>Ações rápidas</h2><p>Atalhos para manter a operação fluindo.</p></div><button className="text-link" type="button">Personalizar <Icon name="settings" size={15} /></button></div>
            <div className="quick-actions">
              {quickActions.map((action) => <button key={action.label} className={`quick-action ${action.tone}`} type="button"><span className="quick-icon"><Icon name={action.icon} size={21} /></span><span>{action.label}</span><Icon name="arrow-right" size={17} /></button>)}
            </div>
          </section>

          <section className="lower-grid">
            <article className="panel activity-panel">
              <div className="section-header"><div><h2>Atividade recente</h2><p>O que aconteceu na sua operação.</p></div><button className="icon-button" type="button" aria-label="Mais atividade"><Icon name="more" /></button></div>
              <ul className="activity-list">
                <li><span className="activity-icon green"><Icon name="finance" size={17} /></span><div><strong>Caixa recebeu R$ 1.286,00</strong><p>Pedido #OR-0421 · Há 8 minutos</p></div><button type="button" aria-label="Mais detalhes"><Icon name="more" size={18} /></button></li>
                <li><span className="activity-icon orange"><Icon name="restaurant" size={17} /></span><div><strong>Nova comanda aberta na Mesa 12</strong><p>Por Marina Souza · Há 14 minutos</p></div><button type="button" aria-label="Mais detalhes"><Icon name="more" size={18} /></button></li>
                <li><span className="activity-icon blue"><Icon name="truck" size={17} /></span><div><strong>Entrega #DE-238 saiu para rota</strong><p>Motorista: João Lima · Há 22 minutos</p></div><button type="button" aria-label="Mais detalhes"><Icon name="more" size={18} /></button></li>
              </ul>
              <button className="panel-footer-link" type="button">Ver todas as atividades <Icon name="arrow-right" size={16} /></button>
            </article>

            <article className="panel modules-panel">
              <div className="section-header"><div><h2>Seus sistemas</h2><p>Troque de contexto sem perder a visão.</p></div><button className="icon-button" type="button" aria-label="Todos os sistemas"><Icon name="grid" /></button></div>
              <div className="module-list">
                {modules.slice(1).map((module) => <button key={module.label} type="button" onClick={() => setActiveModule(module.label)}><span className="module-icon"><Icon name={module.icon} size={19} /></span><span><strong>{module.label}</strong><small>{module.description}</small></span><Icon name="arrow-right" size={16} /></button>)}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
