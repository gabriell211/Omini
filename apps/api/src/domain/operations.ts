export const restaurantOrderTransitions = {
  open: ["sent", "cancelled"],
  sent: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["closed", "cancelled"],
  closed: [],
  cancelled: []
} as const;

export type RestaurantOrderStatus = keyof typeof restaurantOrderTransitions;

export function assertRestaurantOrderTransition(current: RestaurantOrderStatus, next: RestaurantOrderStatus): void {
  if (!restaurantOrderTransitions[current].includes(next as never)) {
    throw new Error("INVALID_ORDER_TRANSITION");
  }
}

export function calculateLineTotal(quantity: number, unitCents: number): number {
  if (!Number.isInteger(quantity) || !Number.isInteger(unitCents) || quantity <= 0 || unitCents < 0) {
    throw new Error("INVALID_MONETARY_LINE");
  }
  return quantity * unitCents;
}

export function calculateTotal(lines: readonly { quantity: number; unitCents: number }[]): number {
  const total = lines.reduce((sum, line) => sum + calculateLineTotal(line.quantity, line.unitCents), 0);
  if (!Number.isSafeInteger(total)) throw new Error("TOTAL_TOO_LARGE");
  return total;
}
