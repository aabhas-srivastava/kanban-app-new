import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private usersService : UsersService,
        private jwtService : JwtService,
    ) {}

    async signup(dto : SignupDto){
        const extistingUser = await this.usersService.findByEmail(dto.email);

        if(extistingUser){
            throw new ConflictException('email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            name : dto.name,
            email : dto.email,
            passwordHash,
        });

        const payload = {sub : user._id.toString(), email : user.email};
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user : {
                id : user._id.toString(),
                name : user.name,
                email : user.email,
            },
        };
    }

    async login(dto : LoginDto){
        const user = await this.usersService.findByEmail(dto.email);

        if(!user){
            throw new UnauthorizedException('invalid credentials');
        }

        const isPassword = await bcrypt.compare(dto.password, user.passwordHash);

        if(!isPassword){
            throw new UnauthorizedException('invalid credentials');
        }

        const payload = {sub : user._id.toString(), email : user.email};
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user : {
                id : user._id.toString(),
                name : user.name,
                email : user.email,
            },
        };
    }
}
