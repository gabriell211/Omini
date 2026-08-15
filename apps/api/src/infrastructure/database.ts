import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../generated/prisma/client.js";

export type DatabaseTransaction = Prisma.TransactionClient;

export class Database {
  public readonly client: PrismaClient;

  public constructor(connectionString: string) {
    this.client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  public async withTenant<T>(organizationId: string, operation: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.client.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT set_config('app.current_organization_id', ${organizationId}, true)`;
      return operation(transaction);
    });
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}
