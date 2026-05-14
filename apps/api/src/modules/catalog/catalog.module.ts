import { Module } from "@nestjs/common";
import { CatalogSeedService } from "./catalog-seed.service";
import { CatalogController } from "./catalog.controller";

@Module({
  controllers: [CatalogController],
  providers: [CatalogSeedService],
})
export class CatalogModule {}
