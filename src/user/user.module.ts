import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { CsvModule } from "nest-csv-parser";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    CsvModule
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {
}
