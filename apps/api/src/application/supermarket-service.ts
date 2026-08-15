import { calculateTotal } from "../domain/operations.js";
import type { Database } from "../infrastructure/database.js";

export class SupermarketService {
  public constructor(private readonly database: Database) {}

  public async createProduct(organizationId: string, input: { sku: string; barcode?: string | undefined; name: string; unit: string; salePriceCents: number }) {
    return this.database.withTenant(organizationId, async (transaction) => {
      const product = await transaction.product.create({ data: {
        organizationId,
        sku: input.sku,
        name: input.name,
        unit: input.unit,
        salePriceCents: input.salePriceCents,
        ...(input.barcode ? { barcode: input.barcode } : {})
      } });
      await transaction.inventoryBalance.create({ data: { organizationId, productId: product.id, quantity: 0 } });
      return product;
    });
  }

  public async adjustInventory(organizationId: string, productId: string, delta: number) {
    if (!Number.isInteger(delta) || delta === 0) throw new Error("INVALID_INVENTORY_DELTA");
    return this.database.withTenant(organizationId, async (transaction) => {
      const balance = await transaction.inventoryBalance.findFirst({ where: { organizationId, productId } });
      if (!balance) throw new Error("PRODUCT_NOT_FOUND");
      const nextQuantity = balance.quantity + delta;
      if (nextQuantity < 0) throw new Error("INSUFFICIENT_STOCK");
      return transaction.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantity: nextQuantity, updatedAt: new Date() }
      });
    });
  }

  public async confirmSale(organizationId: string, input: { items: readonly { productId: string; quantity: number }[] }) {
    return this.database.withTenant(organizationId, async (transaction) => {
      if (input.items.length === 0) throw new Error("SALE_ITEMS_REQUIRED");
      const productIds = input.items.map((item) => item.productId);
      if (new Set(productIds).size !== productIds.length) throw new Error("DUPLICATE_SALE_PRODUCT");
      const products = await transaction.product.findMany({ where: { organizationId, id: { in: productIds }, active: true } });
      if (products.length !== input.items.length) throw new Error("PRODUCT_NOT_FOUND");
      const pricedItems = input.items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        return { ...item, unitCents: product.salePriceCents };
      });
      const totalCents = calculateTotal(pricedItems);
      for (const item of pricedItems) {
        const balance = await transaction.inventoryBalance.findFirst({ where: { organizationId, productId: item.productId } });
        if (!balance || balance.quantity < item.quantity) throw new Error("INSUFFICIENT_STOCK");
        await transaction.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity - item.quantity, updatedAt: new Date() }
        });
      }
      return transaction.supermarketSale.create({
        data: {
          organizationId,
          status: "paid",
          totalCents,
          items: { create: pricedItems.map(({ productId, quantity, unitCents }) => ({ productId, quantity, unitCents })) }
        },
        include: { items: true }
      });
    });
  }
}
