import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { json } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.use(json({ limit: '15Mb' }))
  await app.listen(3000);

}

bootstrap();
