import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const {email} = payload;
        const user = await this.userRepository.findOneBy({ email } );
        if (!user) {
            throw new UnauthorizedException('Token not valid');
        }
        if(!user.isActive) throw new UnauthorizedException('User is inactive, talk with an admin');
        return user;
    }
}
