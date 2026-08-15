import { calculateTotal, assertRestaurantOrderTransition, type RestaurantOrderStatus } from "../domain/operations.js";
import type { Database } from "../infrastructure/database.js";

export class RestaurantService {
  public constructor(private readonly database: Database) {}

  public async listTables(organizationId: string) {
    return this.database.withTenant(organizationId, (transaction) => transaction.restaurantTable.findMany({
      where: { organizationId }, orderBy: { name: "asc" }
    }));
  }

  public async createTable(organizationId: string, input: { name: string; capacity: number }) {
    return this.database.withTenant(organizationId, (transaction) => transaction.restaurantTable.create({
      data: { organizationId, name: input.name, capacity: input.capacity }
    }));
  }

  public async updateTable(organizationId: string, tableId: string, input: { name?: string | undefined; capacity?: number | undefined; status?: "available" | "reserved" | "disabled" | undefined }) {
    return this.database.withTenant(organizationId, async (transaction) => {
      const table = await transaction.restaurantTable.findFirst({ where: { id: tableId, organizationId } });
      if (!table) throw new Error("TABLE_NOT_FOUND");
      if (table.status === "occupied" && input.status) throw new Error("TABLE_IN_USE");
      return transaction.restaurantTable.update({
        where: { id: table.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          updatedAt: new Date()
        }
      });
    });
  }

  public async deleteTable(organizationId: string, tableId: string) {
    return this.database.withTenant(organizationId, async (transaction) => {
      const table = await transaction.restaurantTable.findFirst({ where: { id: tableId, organizationId } });
      if (!table) throw new Error("TABLE_NOT_FOUND");
      const activeOrders = await transaction.restaurantOrder.count({
        where: { organizationId, tableId, status: { in: ["open", "sent", "preparing", "ready"] } }
      });
      if (activeOrders > 0) throw new Error("TABLE_IN_USE");
      await transaction.restaurantTable.delete({ where: { id: table.id } });
    });
  }

  public async listOrders(organizationId: string, status?: RestaurantOrderStatus | undefined) {
    return this.database.withTenant(organizationId, (transaction) => transaction.restaurantOrder.findMany({
      where: { organizationId, ...(status ? { status } : {}) },
      include: { items: true, table: true },
      orderBy: { createdAt: "desc" },
      take: 100
    }));
  }

  public async createOrder(
    organizationId: string,
    input: { tableId?: string | undefined; items: readonly { name: string; quantity: number; unitCents: number }[] }
  ) {
    const subtotalCents = calculateTotal(input.items);
    return this.database.withTenant(organizationId, async (transaction) => {
      if (input.tableId) {
        const table = await transaction.restaurantTable.findFirst({
          where: { id: input.tableId, organizationId, status: { in: ["available", "reserved"] } }
        });
        if (!table) throw new Error("TABLE_NOT_AVAILABLE");
        await transaction.restaurantTable.update({ where: { id: table.id }, data: { status: "occupied" } });
      }
      return transaction.restaurantOrder.create({
        data: {
          organizationId,
          ...(input.tableId ? { tableId: input.tableId } : {}),
          subtotalCents,
          items: { create: input.items.map((item) => ({ ...item })) }
        },
        include: { items: true }
      });
    });
  }

  public async transitionOrder(organizationId: string, orderId: string, nextStatus: RestaurantOrderStatus) {
    return this.database.withTenant(organizationId, async (transaction) => {
      const order = await transaction.restaurantOrder.findFirst({ where: { id: orderId, organizationId } });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      assertRestaurantOrderTransition(order.status as RestaurantOrderStatus, nextStatus);
      const updated = await transaction.restaurantOrder.update({
        where: { id: order.id },
        data: { status: nextStatus, updatedAt: new Date() }
      });
      if (updated.tableId && (nextStatus === "closed" || nextStatus === "cancelled")) {
        await transaction.restaurantTable.update({ where: { id: updated.tableId }, data: { status: "available", updatedAt: new Date() } });
      }
      return updated;
    });
  }

  public async addItem(organizationId: string, orderId: string, item: { name: string; quantity: number; unitCents: number }) {
    const lineTotal = calculateTotal([item]);
    return this.database.withTenant(organizationId, async (transaction) => {
      const order = await transaction.restaurantOrder.findFirst({ where: { id: orderId, organizationId } });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== "open") throw new Error("ORDER_NOT_EDITABLE");
      const created = await transaction.restaurantOrderItem.create({ data: { orderId, ...item } });
      await transaction.restaurantOrder.update({
        where: { id: orderId },
        data: { subtotalCents: order.subtotalCents + lineTotal, updatedAt: new Date() }
      });
      return created;
    });
  }
}
