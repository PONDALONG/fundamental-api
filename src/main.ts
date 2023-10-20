import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { json } from "express";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use((req: any, res: any, next: any) => {
    res.charset = "utf-8";
    next();
  });
  app.use(json({ limit: "15Mb" }));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);

}

bootstrap();
