import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "node:path";
import { AppModule } from "./app.module";

const API_HOST = process.env["NODE_ENV"] === "production" ? "0.0.0.0" : "127.0.0.1";
const API_PREFIX = "api/v1";
const DEFAULT_API_PORT = 4000;
const DEFAULT_APP_ORIGINS = ["http://127.0.0.1:3000", "http://localhost:3000"];
const SWAGGER_PATH = "api/docs";
const STORAGE_DIR = "storage";
const STORAGE_PREFIX = "/storage/";

function resolvePort(value: string | undefined): number {
  if (!value) return DEFAULT_API_PORT;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_API_PORT;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);
  const envOrigin = config.get<string>("APP_ORIGIN");
  const origins = envOrigin
    ? [...new Set([envOrigin, ...DEFAULT_APP_ORIGINS])]
    : DEFAULT_APP_ORIGINS;

  app.setGlobalPrefix(API_PREFIX);
  app.useStaticAssets(join(process.cwd(), STORAGE_DIR), { prefix: STORAGE_PREFIX });
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const documentConfig = new DocumentBuilder()
    .setTitle("Biznesjon API")
    .setDescription("Professional education, community, messaging and PromoVideo platform API.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = resolvePort(config.get<string>("PORT"));
  await app.listen(port, API_HOST);
  console.log(`Biznesjon API ready at http://${API_HOST}:${port}/${API_PREFIX}`);
}

bootstrap().catch((error: unknown) => {
  console.error("Biznesjon API failed to start", error);
  process.exitCode = 1;
});
