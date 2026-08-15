import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { BillingWebhookService } from "../src/application/billing-webhook-service.js";
import type { Database } from "../src/infrastructure/database.js";

const secret = "a-secure-webhook-secret-with-more-than-32-characters";
const service = new BillingWebhookService({} as Database, secret);

describe("billing webhook boundary", () => {
  it("accepts only a signature created from the exact raw body", () => {
    const body = Buffer.from('{"id":"evt_01"}', "utf8");
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(() => service.verifySignature(body, `sha256=${signature}`)).not.toThrow();
    expect(() => service.verifySignature(body, "sha256=invalid")).toThrow("INVALID_WEBHOOK_SIGNATURE");
  });

  it("normalizes only supported subscription events", () => {
    expect(() => service.parse({ id: "evt_01", type: "payment.approved", data: { organization_id: "67b7abdd-bbf7-4b50-a66d-a4d1474b7da9" } })).not.toThrow();
    expect(() => service.parse({ id: "evt_01", type: "payment.approved", data: {} })).toThrow();
  });
});
