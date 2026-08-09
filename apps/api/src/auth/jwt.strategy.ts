import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'deploymate_super_secret_jwt_access_key_change_in_prod',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL error in JwtStrategy, using payload fallback: ${err.message}`);
    }

    // Zero-downtime authentication fallback
    return {
      id: payload.sub,
      email: payload.email || 'developer@deploymate.io',
      name: payload.email ? payload.email.split('@')[0] : 'Developer',
      role: payload.role || 'USER',
    };
  }
}
