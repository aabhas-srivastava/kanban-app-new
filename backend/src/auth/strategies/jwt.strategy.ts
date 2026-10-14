import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private configService : ConfigService,
        private userService : UsersService, 
    ) {
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    async validate(payload : {sub : string, email : string}) {
        const user = await this.userService.findById(payload.sub);
        if(!user){
            throw new UnauthorizedException();
        }

        return {
            userId : user._id.toString(),
            email : user.email,
            name : user.name,
        }
    }
}