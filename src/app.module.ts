import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from './notification/notifications.module';
import { VaultModule } from './vault/vault.module';
import { Account } from './account/account.entity';
import { Vault } from './vault/vault.entity';
import { Event } from './event/event.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ScannerManagerModule } from './handler/handler.module';
import { LastBlock } from './listener/lastBlock.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'ditto.db',
      entities: [Account, Event, Vault, LastBlock],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    ScannerManagerModule,
    NotificationsModule,
    VaultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
