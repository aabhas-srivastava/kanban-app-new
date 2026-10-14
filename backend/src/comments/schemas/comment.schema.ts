import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  cardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  text: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ cardId: 1, createdAt: -1 });