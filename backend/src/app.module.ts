import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BoardsModule } from './boards/boards.module.js';
import { ColumnsModule } from './columns/columns.module.js';
import { CardsModule } from './cards/cards.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { ActivityModule } from './activity/activity.module.js';

@Module({

  imports : [
    ConfigModule.forRoot({
      isGlobal : true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
    CommentsModule,
    ActivityModule,
  ],
  
  controllers : [],
  providers : [],

})
export class AppModule {}
