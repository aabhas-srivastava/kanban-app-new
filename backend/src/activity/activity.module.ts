import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service.js';
import { ActivityController } from './activity.controller.js';
import { Activity, ActivitySchema } from './schemas/activity.schema.js';
import { BoardsModule } from '../boards/boards.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }]),
    BoardsModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}