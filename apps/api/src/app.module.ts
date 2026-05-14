import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserIdMiddleware } from "./user-id.middleware";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { DatabaseModule } from "./modules/database/database.module";
import { GroupsModule } from "./modules/groups/groups.module";
import { HealthModule } from "./modules/health/health.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PromoVideosModule } from "./modules/promo-videos/promo-videos.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["apps/api/.env", ".env"] }),
    DatabaseModule,
    HealthModule,
    CatalogModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    MessagesModule,
    GroupsModule,
    PromoVideosModule,
    NotificationsModule,
    AdminModule,
    UploadsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserIdMiddleware).forRoutes("*");
  }
}
