"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { Logo } from "./logo";

type TableStatus = "livre" | "ocupada" | "aguardando" | "fechando";
type Table = { readonly number: string; readonly guests: number; readonly total: string; readonly status: TableStatus; readonly elapsed: string };

const tables: readonly Table[] = [
  { number: "01", guests: 2, total: "R$ 86,00", status: "ocupada", elapsed: "35 min" },
  { number: "02", guests: 4, total: "R$ 228,50", status: "aguardando", elapsed: "52 min" },
  { number: "03", guests: 0, total: "", status: "livre", elapsed: "" },
  { number: "04", guests: 3, total: "R$ 142,00", status: "ocupada", elapsed: "18 min" },
  { number: "05", guests: 2, total: "R$ 64,00", status: "fechando", elapsed: "1h 09" },
  { number: "06", guests: 0, total: "", status: "livre", elapsed: "" },
  { number: "07", guests: 5, total: "R$ 311,00", status: "aguardando", elapsed: "44 min" },
  { number: "08", guests: 0, total: "", status: "livre", elapsed: "" }
];

const tabs = ["Salão", "Comandas", "Cozinha", "Delivery", "Caixa"] as const;
const kitchenOrders = [
  { order: "#421", table: "Mesa 02", items: "2× Smash bacon · 1× Fritas", elapsed: "18 min", tone: "urgent" },
  { order: "#423", table: "Mesa 07", items: "3× Bowl mediterrâneo", elapsed: "12 min", tone: "normal" },
  { order: "#419", table: "Mesa 01", items: "1× Risoto de cogumelos", elapsed: "24 min", tone: "urgent" }
] as const;

export function RestaurantOperations() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Salão");
  const [selectedTableNumber, setSelectedTableNumber] = useState("02");
  const [draftItems, setDraftItems] = useState(0);
  const selectedTable = useMemo(() => tables.find((table) => table.number === selectedTableNumber) ?? tables[0]!, [selectedTableNumber]);

  return (
    <div className="restaurant-app">
      <header className="restaurant-topbar">
        <Link href="/home" aria-label="Voltar ao painel"><Logo /></Link>
        <div className="restaurant-venue"><span className="restaurant-venue-dot" /><span><strong>Casa Verde</strong><small>Unidade Jardins · Turno aberto</small></span><Icon name="chevron-down" size={16} /></div>
        <div className="restaurant-top-actions"><span className="live-indicator"><i /> Operação ao vivo</span><button className="restaurant-icon-button" type="button" aria-label="Notificações"><Icon name="bell" /></button><span className="avatar avatar-small">GA</span></div>
      </header>

      <main className="restaurant-content">
        <div className="restaurant-heading"><div><p>Restaurante / Operação atual</p><h1>Salão e produção</h1><span>12 mesas · 7 ocupadas · 3 pedidos aguardando</span></div><div className="restaurant-heading-actions"><button type="button" className="restaurant-secondary"><Icon name="chart" size={17} /> Fechamento parcial</button><button type="button" className="restaurant-primary"><Icon name="plus" size={17} /> Nova comanda</button></div></div>
        <nav className="restaurant-tabs" aria-label="Módulos do restaurante">{tabs.map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}{tab === "Cozinha" && <b>3</b>}</button>)}</nav>

        {activeTab === "Salão" ? <section className="restaurant-grid">
          <article className="floor-panel">
            <div className="restaurant-section-title"><div><h2>Mapa do salão</h2><p>Toque em uma mesa para abrir a comanda.</p></div><div className="table-legend"><span><i className="free" />Livre</span><span><i className="occupied" />Ocupada</span><span><i className="waiting" />Aguardando</span></div></div>
            <div className="floor-map">
              <div className="floor-label">JANELA</div><div className="floor-divider" />
              {tables.map((table) => <button type="button" key={table.number} onClick={() => setSelectedTableNumber(table.number)} className={`floor-table ${table.status} ${selectedTable.number === table.number ? "selected" : ""}`}><strong>{table.number}</strong>{table.status === "livre" ? <small>LIVRE</small> : <><span><Icon name="users" size={12} /> {table.guests}</span><small>{table.elapsed}</small></>}</button>)}
              <div className="floor-label bar">BAR</div>
            </div>
          </article>

          <aside className="order-panel">
            <div className="order-panel-head"><div><span className={`status-chip ${selectedTable.status}`}>{selectedTable.status === "aguardando" ? "Aguardando cozinha" : selectedTable.status}</span><h2>Mesa {selectedTable.number}</h2><p>{selectedTable.guests ? `${selectedTable.guests} pessoas · aberta há ${selectedTable.elapsed}` : "Sem clientes"}</p></div><button type="button" className="restaurant-icon-button" aria-label="Mais opções"><Icon name="more" /></button></div>
            {selectedTable.status === "livre" ? <div className="empty-order"><span><Icon name="restaurant" size={25} /></span><strong>Mesa disponível</strong><p>Abra uma comanda para começar.</p><button type="button" className="restaurant-primary" onClick={() => setDraftItems(1)}><Icon name="plus" size={17} /> Abrir comanda</button></div> : <><div className="order-items"><div><span>2× Smash bacon</span><strong>R$ 68,00</strong><small>sem cebola · ponto ao ponto</small></div><div><span>1× Fritas da casa</span><strong>R$ 24,00</strong><small>maionese de ervas</small></div><div><span>2× Kombucha limão</span><strong>R$ 21,00</strong></div>{draftItems > 0 && <div><span>{draftItems}× Item adicionado</span><strong>R$ 18,00</strong><small>aguardando envio</small></div>}</div><button type="button" className="add-item" onClick={() => setDraftItems((value) => value + 1)}><Icon name="plus" size={17} /> Adicionar item</button><div className="order-total"><span>Total parcial</span><strong>{draftItems ? "R$ 131,00" : selectedTable.total}</strong></div><div className="order-actions"><button type="button" className="restaurant-secondary">Imprimir pré-conta</button><button type="button" className="restaurant-primary">Enviar pedido</button></div></>}
          </aside>
        </section> : <section className="restaurant-placeholder"><span><Icon name={activeTab === "Cozinha" ? "restaurant" : activeTab === "Caixa" ? "finance" : activeTab === "Delivery" ? "truck" : "grid"} size={32} /></span><h2>{activeTab}</h2><p>Este módulo utiliza o mesmo núcleo operacional e será ativado nesta unidade.</p></section>}

        <section className="kitchen-section"><div className="restaurant-section-title"><div><h2>Fila da cozinha</h2><p>Pedidos que exigem atenção no turno atual.</p></div><button type="button" className="restaurant-link">Abrir KDS <Icon name="arrow-right" size={16} /></button></div><div className="kitchen-list">{kitchenOrders.map((order) => <article key={order.order} className={`kitchen-card ${order.tone}`}><div><strong>{order.order}</strong><span>{order.table}</span></div><p>{order.items}</p><footer><span><i /> Em preparo</span><strong>{order.elapsed}</strong></footer></article>)}</div></section>
      </main>
    </div>
  );
}
