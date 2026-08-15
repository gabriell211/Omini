import { describe, expect, it } from "vitest";
import { calculateTotal, assertRestaurantOrderTransition } from "../src/domain/operations.js";

describe("operational domain rules", () => {
  it("does not allow a restaurant order to skip its kitchen workflow", () => {
    expect(() => assertRestaurantOrderTransition("open", "ready")).toThrow("INVALID_ORDER_TRANSITION");
    expect(() => assertRestaurantOrderTransition("sent", "preparing")).not.toThrow();
  });

  it("calculates totals only from valid integer cent lines", () => {
    expect(calculateTotal([{ quantity: 2, unitCents: 1290 }, { quantity: 1, unitCents: 500 }])).toBe(3080);
    expect(() => calculateTotal([{ quantity: 0, unitCents: 100 }])).toThrow("INVALID_MONETARY_LINE");
  });
});
