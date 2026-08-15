import { calculateTotal, assertRestaurantOrderTransition, type RestaurantOrderStatus } from "../domain/operations.js";
import type { Database } from "../infrastructure/database.js";

export class RestaurantService {
  public constructor(private readonly database: Database) {}

  public async createTable(organizationId: string, input: { name: string; capacity: number }) {
    return this.database.withTenant(organizationId, (transaction) => transaction.restaurantTable.create({
      data: { organizationId, name: input.name, capacity: input.capacity }
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
}
