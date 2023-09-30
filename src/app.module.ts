import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImportControllers, ImportEntities, ImportServices } from "./base-import";
import * as process from "process";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ImportEntities,
      synchronize: true
    }),
    TypeOrmModule.forFeature(ImportEntities),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: "30d" }
    })
  ],
  controllers: [AppController, ...ImportControllers],
  providers: [AppService, ...ImportServices]
})
export class AppModule {
}
