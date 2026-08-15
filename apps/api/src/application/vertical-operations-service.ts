import type { Database } from "../infrastructure/database.js";

export class VerticalOperationsService {
  public constructor(private readonly database: Database) {}

  public listPharmacyLots(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.pharmacyLot.findMany({ where: { organizationId }, orderBy: { expiresAt: "asc" }, take: 200 })); }
  public createPharmacyLot(organizationId: string, input: { productName: string; batchNumber: string; expiresAt: Date; quantity: number }) { return this.database.withTenant(organizationId, (tx) => tx.pharmacyLot.create({ data: { organizationId, ...input } })); }
  public updatePharmacyLot(organizationId: string, id: string, input: { quantity?: number | undefined; status?: "available" | "blocked" | "expired" | undefined; expiresAt?: Date | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.pharmacyLot.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("PHARMACY_LOT_NOT_FOUND");
    return tx.pharmacyLot.update({ where: { id }, data: { ...(input.quantity !== undefined ? { quantity: input.quantity } : {}), ...(input.status ? { status: input.status } : {}), ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}), updatedAt: new Date() } });
  }); }

  public listLegalCases(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.legalCase.findMany({ where: { organizationId }, orderBy: [{ nextDeadline: "asc" }, { createdAt: "desc" }], take: 200 })); }
  public createLegalCase(organizationId: string, input: { caseNumber: string; title: string; clientName: string; nextDeadline?: Date | undefined }) { return this.database.withTenant(organizationId, (tx) => tx.legalCase.create({ data: { organizationId, caseNumber: input.caseNumber, title: input.title, clientName: input.clientName, ...(input.nextDeadline ? { nextDeadline: input.nextDeadline } : {}) } })); }
  public updateLegalCase(organizationId: string, id: string, input: { title?: string | undefined; clientName?: string | undefined; status?: "open" | "paused" | "closed" | undefined; nextDeadline?: Date | null | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.legalCase.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("LEGAL_CASE_NOT_FOUND");
    return tx.legalCase.update({ where: { id }, data: { ...(input.title !== undefined ? { title: input.title } : {}), ...(input.clientName !== undefined ? { clientName: input.clientName } : {}), ...(input.status ? { status: input.status } : {}), ...(input.nextDeadline !== undefined ? { nextDeadline: input.nextDeadline } : {}), updatedAt: new Date() } });
  }); }

  public listVeterinaryPatients(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.veterinaryPatient.findMany({ where: { organizationId }, orderBy: { name: "asc" }, take: 200 })); }
  public createVeterinaryPatient(organizationId: string, input: { name: string; species: string; breed?: string | undefined; guardianName: string }) { return this.database.withTenant(organizationId, (tx) => tx.veterinaryPatient.create({ data: { organizationId, name: input.name, species: input.species, guardianName: input.guardianName, ...(input.breed ? { breed: input.breed } : {}) } })); }
  public updateVeterinaryPatient(organizationId: string, id: string, input: { name?: string | undefined; species?: string | undefined; breed?: string | null | undefined; guardianName?: string | undefined; status?: "active" | "inactive" | "deceased" | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.veterinaryPatient.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("VETERINARY_PATIENT_NOT_FOUND");
    return tx.veterinaryPatient.update({ where: { id }, data: { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.species !== undefined ? { species: input.species } : {}), ...(input.breed !== undefined ? { breed: input.breed } : {}), ...(input.guardianName !== undefined ? { guardianName: input.guardianName } : {}), ...(input.status ? { status: input.status } : {}), updatedAt: new Date() } });
  }); }
  public listVeterinaryAppointments(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.veterinaryAppointment.findMany({ where: { organizationId }, include: { patient: true }, orderBy: { scheduledAt: "asc" }, take: 200 })); }
  public createVeterinaryAppointment(organizationId: string, input: { patientId: string; scheduledAt: Date; appointmentType: string; notes?: string | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const patient = await tx.veterinaryPatient.findFirst({ where: { id: input.patientId, organizationId, status: "active" } }); if (!patient) throw new Error("VETERINARY_PATIENT_NOT_FOUND");
    return tx.veterinaryAppointment.create({ data: { organizationId, patientId: input.patientId, scheduledAt: input.scheduledAt, appointmentType: input.appointmentType, ...(input.notes ? { notes: input.notes } : {}) } });
  }); }
  public updateVeterinaryAppointment(organizationId: string, id: string, input: { scheduledAt?: Date | undefined; status?: "scheduled" | "confirmed" | "completed" | "cancelled" | undefined; notes?: string | null | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.veterinaryAppointment.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("VETERINARY_APPOINTMENT_NOT_FOUND");
    return tx.veterinaryAppointment.update({ where: { id }, data: { ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}), ...(input.status ? { status: input.status } : {}), ...(input.notes !== undefined ? { notes: input.notes } : {}), updatedAt: new Date() } });
  }); }

  public listRepairOrders(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.repairOrder.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 200 })); }
  public createRepairOrder(organizationId: string, input: { orderNumber: string; customerName: string; vehicle: string; estimateCents: number }) { return this.database.withTenant(organizationId, (tx) => tx.repairOrder.create({ data: { organizationId, ...input } })); }
  public updateRepairOrder(organizationId: string, id: string, input: { customerName?: string | undefined; vehicle?: string | undefined; estimateCents?: number | undefined; status?: "open" | "approved" | "in_progress" | "completed" | "cancelled" | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.repairOrder.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("REPAIR_ORDER_NOT_FOUND");
    if ((record.status === "completed" || record.status === "cancelled") && input.status) throw new Error("REPAIR_ORDER_FINALIZED");
    return tx.repairOrder.update({ where: { id }, data: { ...(input.customerName !== undefined ? { customerName: input.customerName } : {}), ...(input.vehicle !== undefined ? { vehicle: input.vehicle } : {}), ...(input.estimateCents !== undefined ? { estimateCents: input.estimateCents } : {}), ...(input.status ? { status: input.status } : {}), updatedAt: new Date() } });
  }); }

  public listBuildingQuotes(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.buildingQuote.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 200 })); }
  public createBuildingQuote(organizationId: string, input: { quoteNumber: string; customerName: string; totalCents: number; deliveryDate?: Date | undefined }) { return this.database.withTenant(organizationId, (tx) => tx.buildingQuote.create({ data: { organizationId, quoteNumber: input.quoteNumber, customerName: input.customerName, totalCents: input.totalCents, ...(input.deliveryDate ? { deliveryDate: input.deliveryDate } : {}) } })); }
  public updateBuildingQuote(organizationId: string, id: string, input: { customerName?: string | undefined; totalCents?: number | undefined; deliveryDate?: Date | null | undefined; status?: "draft" | "sent" | "approved" | "expired" | "cancelled" | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.buildingQuote.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("BUILDING_QUOTE_NOT_FOUND");
    return tx.buildingQuote.update({ where: { id }, data: { ...(input.customerName !== undefined ? { customerName: input.customerName } : {}), ...(input.totalCents !== undefined ? { totalCents: input.totalCents } : {}), ...(input.deliveryDate !== undefined ? { deliveryDate: input.deliveryDate } : {}), ...(input.status ? { status: input.status } : {}), updatedAt: new Date() } });
  }); }

  public listVehicleInventory(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.vehicleInventory.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 200 })); }
  public createVehicle(organizationId: string, input: { stockNumber: string; make: string; model: string; modelYear: number; priceCents: number }) { return this.database.withTenant(organizationId, (tx) => tx.vehicleInventory.create({ data: { organizationId, ...input } })); }
  public updateVehicle(organizationId: string, id: string, input: { make?: string | undefined; model?: string | undefined; modelYear?: number | undefined; priceCents?: number | undefined; status?: "available" | "reserved" | "sold" | "inactive" | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.vehicleInventory.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("VEHICLE_NOT_FOUND");
    return tx.vehicleInventory.update({ where: { id }, data: { ...(input.make !== undefined ? { make: input.make } : {}), ...(input.model !== undefined ? { model: input.model } : {}), ...(input.modelYear !== undefined ? { modelYear: input.modelYear } : {}), ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}), ...(input.status ? { status: input.status } : {}), updatedAt: new Date() } });
  }); }
  public listVehicleLeads(organizationId: string) { return this.database.withTenant(organizationId, (tx) => tx.vehicleLead.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 200 })); }
  public createVehicleLead(organizationId: string, input: { customerName: string; phone?: string | undefined; interest: string }) { return this.database.withTenant(organizationId, (tx) => tx.vehicleLead.create({ data: { organizationId, customerName: input.customerName, interest: input.interest, ...(input.phone ? { phone: input.phone } : {}) } })); }
  public updateVehicleLead(organizationId: string, id: string, input: { customerName?: string | undefined; phone?: string | null | undefined; interest?: string | undefined; status?: "new" | "contacted" | "negotiating" | "won" | "lost" | undefined }) { return this.database.withTenant(organizationId, async (tx) => {
    const record = await tx.vehicleLead.findFirst({ where: { id, organizationId } }); if (!record) throw new Error("VEHICLE_LEAD_NOT_FOUND");
    return tx.vehicleLead.update({ where: { id }, data: { ...(input.customerName !== undefined ? { customerName: input.customerName } : {}), ...(input.phone !== undefined ? { phone: input.phone } : {}), ...(input.interest !== undefined ? { interest: input.interest } : {}), ...(input.status ? { status: input.status } : {}), updatedAt: new Date() } });
  }); }
}
