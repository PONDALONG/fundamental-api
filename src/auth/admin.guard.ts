import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UserService } from "../user/user.service";
import { UserRole } from "../user/dto/user.enum";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // return true;
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET_KEY
        }
      );
      const user = await this.userService.findOne(payload["userId"]);
      if (!user) throw new UnauthorizedException();
      if (user.role !== UserRole.TEACHER) throw new UnauthorizedException();

      request["user"] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}