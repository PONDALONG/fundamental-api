import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BaseControllers, BaseEntity, BaseServices } from "./base-entity";
import * as process from "process";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./auth/auth.constants";

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
    TypeOrmModule.forFeature(BaseEntity),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "30d" }
    })
  ],
  controllers: BaseControllers,
  providers: BaseServices
})
export class AppModule {
}
