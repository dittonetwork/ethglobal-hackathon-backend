import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AccountModule } from 'src/account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { Event } from 'src/event/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, AccountModule],
})
export class NotificationsModule {}
