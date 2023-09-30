import { Module } from "@nestjs/common";
import { BaseControllers, BaseEntity, BaseServices } from "./base-entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import * as process from "process";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    TypeOrmModule.forFeature(BaseEntity),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: "30d" }
    })
  ],
  controllers: BaseControllers,
  providers: BaseServices
})
export class BaseModule {
}
