import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Activity {

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', default: null })
  cardId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  meta: Record<string, any>;
  
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

ActivitySchema.index({ boardId: 1, createdAt: -1 });
ActivitySchema.index({ cardId: 1, createdAt: -1 });