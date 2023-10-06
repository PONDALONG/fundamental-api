import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImportControllers, ImportEntities, ImportServices } from "./base-import";
import * as process from "process";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { Constant } from "./utils/constant";

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
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", Constant.PUBLIC_PATH)
    })

  ],
  controllers: [AppController, ...ImportControllers],
  providers: [AppService, ...ImportServices],
  exports: [...ImportServices]
})
export class AppModule {
}
