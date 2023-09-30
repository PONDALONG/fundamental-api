import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BaseEntity } from "./base-entity";
import * as process from "process";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BaseModule } from "./base.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: BaseEntity,
      synchronize: true
    }),
    BaseModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
