import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Task } from './task/task.entity';
import { User } from './user/user.entity';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: path.join(__dirname, '..', 'database.sqlite'),
      autoSave: true,
      entities: [Task, User],
      synchronize: true,
    }),
    TaskModule,
    AuthModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
