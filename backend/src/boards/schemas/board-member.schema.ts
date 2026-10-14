import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardMemberDocument = BoardMember & Document;

export enum BoardRole {
    OWNER = 'owner',
    MEMBER = 'member',
    VIEWER = 'viewer',
}

@Schema({ timestamps : true})
export class BoardMember {
    
    @Prop({ type : Types.ObjectId, ref : 'Board', required : true })
    boardId : Types.ObjectId;

    @Prop({ type : Types.ObjectId, ref : 'User', required : true })
    userId : Types.ObjectId;

    @Prop({ type : String, enum : BoardRole, required : true })
    role : BoardRole;

}

export const BoardMemberSchema = SchemaFactory.createForClass(BoardMember);

BoardMemberSchema.index({boardId : 1, userId : 1}, {unique : true});