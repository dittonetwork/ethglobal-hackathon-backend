import { Module } from '@nestjs/common';
import { EventListenerService } from './eventListener.service';
import { LastBlock } from './lastBlock.model';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionParserService } from './transactionParser.service';

@Module({
  imports: [TypeOrmModule.forFeature([LastBlock])],
  providers: [EventListenerService, TransactionParserService],
  exports: [TransactionParserService, EventListenerService],
})
export class ListenerModule {}
