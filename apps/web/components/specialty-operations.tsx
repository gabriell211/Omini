"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./icon";
import { Logo } from "./logo";

type Metric = { readonly label: string; readonly value: string; readonly detail: string; readonly icon: IconName };
type WorkItem = { readonly title: string; readonly detail: string; readonly status: string; readonly tone: "green" | "orange" | "blue" };

export type SpecialtyConfig = {
  readonly label: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: IconName;
  readonly action: string;
  readonly tabs: readonly string[];
  readonly metrics: readonly Metric[];
  readonly workItems: readonly WorkItem[];
  readonly modules: readonly { readonly title: string; readonly detail: string; readonly icon: IconName }[];
};

export function SpecialtyOperations({ config }: { readonly config: SpecialtyConfig }) {
  const [activeTab, setActiveTab] = useState(config.tabs[0]!);
  const [selectedItem, setSelectedItem] = useState(config.workItems[0]?.title ?? "");

  return <div className="specialty-app">
    <header className="specialty-topbar"><Link href="/home" aria-label="Voltar ao painel"><Logo /></Link><div className="specialty-context"><span className="specialty-mark"><Icon name={config.icon} size={18} /></span><span><strong>{config.label}</strong><small>Unidade Central · Operação ativa</small></span><Icon name="chevron-down" size={16} /></div><div className="specialty-actions"><button type="button" aria-label="Buscar"><Icon name="search" /></button><button type="button" aria-label="Notificações"><Icon name="bell" /></button><span className="avatar avatar-small">GA</span></div></header>
    <main className="specialty-content">
      <section className="specialty-heading"><div><p>{config.label} / Operação atual</p><h1>{config.title}</h1><span>{config.subtitle}</span></div><button type="button" className="specialty-primary"><Icon name="plus" size={17} /> {config.action}</button></section>
      <nav className="specialty-tabs" aria-label={`Módulos de ${config.label}`}>{config.tabs.map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
      <section className="specialty-metrics">{config.metrics.map((metric) => <article key={metric.label}><span className="specialty-metric-icon"><Icon name={metric.icon} size={18} /></span><p>{metric.label}</p><strong>{metric.value}</strong><small>{metric.detail}</small></article>)}</section>
      <section className="specialty-workspace"><article className="specialty-work-list"><div className="specialty-section-title"><div><h2>{activeTab}</h2><p>Prioridades que precisam de ação agora.</p></div><button type="button"><Icon name="more" /></button></div><div>{config.workItems.map((item) => <button key={item.title} type="button" className={selectedItem === item.title ? "selected" : ""} onClick={() => setSelectedItem(item.title)}><span className={`specialty-status ${item.tone}`} /><span><strong>{item.title}</strong><small>{item.detail}</small></span><em>{item.status}</em><Icon name="arrow-right" size={16} /></button>)}</div></article><aside className="specialty-detail"><span className="specialty-detail-icon"><Icon name={config.icon} size={24} /></span><p>EM ATENDIMENTO</p><h2>{selectedItem || "Nenhuma atividade selecionada"}</h2><span className="specialty-detail-text">Informações, histórico, anexos e ações relacionadas aparecem reunidos aqui, sem alternar entre sistemas.</span><div><button type="button" className="specialty-primary">Abrir detalhes</button><button type="button" className="specialty-secondary">Adicionar observação</button></div></aside></section>
      <section className="specialty-modules"><div className="specialty-section-title"><div><h2>Capacidades do sistema</h2><p>Módulos isolados, conectados à operação.</p></div></div><div>{config.modules.map((module) => <article key={module.title}><span><Icon name={module.icon} size={20} /></span><strong>{module.title}</strong><p>{module.detail}</p><button type="button" aria-label={`Abrir ${module.title}`}><Icon name="arrow-right" size={16} /></button></article>)}</div></section>
    </main>
  </div>;
}
