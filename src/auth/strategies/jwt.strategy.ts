import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {
        const secret = 's3cr3tjwt2025';
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        console.log('🔥 Entró a JwtStrategy.validate');
        const { uuid } = payload;
        const user = await this.userRepository.findOne({
            where: { uuid },
            relations: ['roles', 'roles.permissions', 'roles.permissions.module', 'roles.permissions.module.moduleCategory'],
        });

        if (!user) {
            throw new UnauthorizedException('Token ni válido!');
        }

        if (!user.is_active) throw new UnauthorizedException('Usuario es inactivo, comunicarse con Administrador!');

        return user;

    }
}
