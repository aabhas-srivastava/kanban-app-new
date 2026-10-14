import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel : Model<UserDocument>,
    ) {}

    async findByEmail(email : string) : Promise<UserDocument | null> {
        return this.userModel.findOne({email : email.toLowerCase() }).exec();
    }

    async findById(id : string) : Promise<UserDocument | null>{
        return this.userModel.findById(id).exec();
    }

    async create(userData : {
        name : string;
        email : string;
        passwordHash : string;
    }) : Promise<UserDocument> {
        const createdUser = new this.userModel(userData);
        return createdUser.save();
    }
}