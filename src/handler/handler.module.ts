import { Module, forwardRef } from '@nestjs/common';
import { Web3DataProviderService } from './web3dataProvider.service';
import { BlockchainEventListenerManager } from './handler.service';
import { ListenerModule } from 'src/listener/listener.module';

@Module({
  imports: [forwardRef(() => ListenerModule)],
  providers: [BlockchainEventListenerManager, Web3DataProviderService],
  exports: [BlockchainEventListenerManager, Web3DataProviderService],
})
export class ScannerManagerModule {}
