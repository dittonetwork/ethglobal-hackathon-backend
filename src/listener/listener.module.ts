import { Module } from '@nestjs/common';
import { EventListenerService } from './eventListener.service';
import { LastBlock } from './lastBlock.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/event/event.entity';
import { TransactionParserService } from './transactionParser.service';
import { Vault } from 'src/vault/vault.entity';
import { Account } from 'src/account/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LastBlock]),
    TypeOrmModule.forFeature([Event]),
    TypeOrmModule.forFeature([Vault]),
    TypeOrmModule.forFeature([Account]),
  ],
  providers: [EventListenerService, TransactionParserService],
  exports: [TransactionParserService, EventListenerService],
})
export class ListenerModule {}
