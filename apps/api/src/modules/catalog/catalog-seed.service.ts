import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { seedCatalog } from "./catalog.seed";

@Injectable()
export class CatalogSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await seedCatalog(this.prisma);
      this.logger.log("Catalog reference data is ready");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error("Failed to seed catalog reference data", message);
    }
  }
}
