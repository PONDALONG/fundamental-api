import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./auth.constants";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "30d" }
    })
  ],
  providers: [AuthService],
  controllers: [],
  exports: [AuthService]
})
export class AuthModule {
}