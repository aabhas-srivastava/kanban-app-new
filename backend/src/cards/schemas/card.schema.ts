import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: Number, required: true })
  position: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignees: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.index({ columnId: 1, position: 1 });
CardSchema.index({ columnId: 1, isArchived: 1 });