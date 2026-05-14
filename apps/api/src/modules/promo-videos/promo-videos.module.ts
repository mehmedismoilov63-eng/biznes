import { Module } from "@nestjs/common";
import { PromoVideosController } from "./promo-videos.controller";

@Module({
  controllers: [PromoVideosController],
})
export class PromoVideosModule {}
