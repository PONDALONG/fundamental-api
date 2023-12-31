import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImportControllers, ImportEntities, ImportServices } from "./base-import";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { Constant } from "./utils/constant";
import { ConfigModule } from "@nestjs/config";

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
      entities: ImportEntities,
      synchronize: false
    }),
    TypeOrmModule.forFeature(ImportEntities),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: "30d" }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", Constant.PUBLIC_PATH)
    })

  ],
  controllers: [AppController, ...ImportControllers],
  providers: [AppService, ...ImportServices]
})
export class AppModule {
}
